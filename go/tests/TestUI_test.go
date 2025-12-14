package tests

import (
	"fmt"
	"github.com/saichler/l8pollaris/go/types/l8tpollaris"
	"os"
	"os/exec"
	"testing"
)

func TestMain(m *testing.M) {
	setup()
	m.Run()
	tear()
}

func TestUsers(t *testing.T) {
	target := &l8tpollaris.L8PTarget{}
	fmt.Println(target)
	exec.Command("rm", "-rf", "./web").Run()
	os.CopyFS("./web", os.DirFS("../ui/web"))
	defer exec.Command("rm", "-rf", "./web").Run()
	startWebServer(9092, "test")
}
