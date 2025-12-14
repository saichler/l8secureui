package tests

import (
	"github.com/saichler/l8bus/go/overlay/health"
	"github.com/saichler/l8pollaris/go/pollaris/targets"
	"github.com/saichler/l8pollaris/go/types/l8tpollaris"
	"github.com/saichler/l8srlz/go/serialize/object"
	"github.com/saichler/l8types/go/ifs"
	"github.com/saichler/l8utils/go/utils/ipsegment"
	"github.com/saichler/l8web/go/web/server"
	"github.com/saichler/probler/go/prob/common"
	"github.com/saichler/probler/go/prob/common/creates"
	"strconv"
)

func startWebServer(port int, cert string) {
	serverConfig := &server.RestServerConfig{
		Host:           ipsegment.MachineIP,
		Port:           port,
		Authentication: true,
		CertName:       cert,
		Prefix:         "/probler/",
	}
	svr, err := server.NewRestServer(serverConfig)
	if err != nil {
		panic(err)
	}

	nic := topo.VnicByVnetNum(3, 1)

	hs, ok := nic.Resources().Services().ServiceHandler(health.ServiceName, 0)
	if ok {
		ws := hs.WebService()
		svr.RegisterWebService(ws, nic)
	}

	targets.Activate("postgres", "probler", nic)
	ts, _ := targets.Targets(nic)
	size := 100
	devices := make([]*l8tpollaris.L8PTarget, size)
	ip := 1
	sub := 40
	for i := 0; i < size; i++ {
		device := creates.CreateDevice("60.50."+strconv.Itoa(sub)+"."+strconv.Itoa(ip), common.NetworkDevice_Links_ID, "sim")
		devices[i] = device
		ip++
		if ip > 254 {
			sub++
			ip = 1
		}
	}
	ts.Post(object.New(nil, devices), nic)

	cluster := creates.CreateCluster("lab")
	ts.Post(object.New(nil, cluster), nic)

	//Activate the webpoints topo_service
	sla := ifs.NewServiceLevelAgreement(&server.WebService{}, ifs.WebService, 0, false, nil)
	sla.SetArgs(svr)
	nic.Resources().Services().Activate(sla, nic)

	nic.Resources().Logger().Info("Web Server Started!")

	svr.Start()
}
