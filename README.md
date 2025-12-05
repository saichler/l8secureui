# Layer 8 Security Console

A comprehensive Authentication, Authorization, and Accounting (AAA) management UI for the Layer 8 distributed ecosystem. This web application provides secure user management, role-based access control, and Two-Factor Authentication (TFA) support.

## Features

### Authentication
- Username/password authentication with bearer token management
- Two-Factor Authentication (TFA) with TOTP support
- QR code generation for authenticator app setup
- "Remember me" functionality
- Configurable session timeout with activity tracking

### User Management
- Create, edit, and delete user accounts
- Assign multiple roles to users
- Password management for new users
- Real-time role assignment display

### Role & Permission Management
- Define roles with unique identifiers
- Create authorization rules per role
- Configure per-action permissions (GET, POST, PUT, PATCH, DELETE, ALL)
- Element-type based access control
- Allow/Deny rule logic
- Custom attribute support for fine-grained control

## Architecture

The application uses a modular multi-app architecture with iframe-based component isolation:

```
┌─────────────────────────────────────────────────────┐
│                   Main Application                   │
│                      (app.js)                        │
│  ┌─────────────────┐    ┌─────────────────┐         │
│  │   Users App     │    │   Roles App     │         │
│  │   (iframe)      │    │   (iframe)      │         │
│  └─────────────────┘    └─────────────────┘         │
└─────────────────────────────────────────────────────┘
           │                      │
           └──────────┬───────────┘
                      │
              ┌───────▼───────┐
              │   Login App   │
              │  (standalone) │
              └───────────────┘
```

## Project Structure

```
l8secureui/
├── go/
│   ├── ui/web/                 # Frontend web application
│   │   ├── index.html          # Main app container
│   │   ├── app.js              # App coordinator
│   │   ├── styles.css          # Global styles
│   │   ├── login.json          # Configuration file
│   │   │
│   │   ├── login/              # Login application
│   │   │   ├── index.html
│   │   │   ├── login.js
│   │   │   ├── login.css
│   │   │   ├── config.js
│   │   │   ├── logo.gif        # App logo (user provided)
│   │   │   └── Layer8Logo.gif  # Layer 8 branding (user provided)
│   │   │
│   │   ├── users/              # Users management app
│   │   │   ├── index.html
│   │   │   ├── users.js
│   │   │   ├── users.css
│   │   │   └── config.js
│   │   │
│   │   └── roles/              # Roles management app
│   │       ├── index.html
│   │       ├── roles.js
│   │       ├── roles.css
│   │       └── config.js
│   │
│   ├── tests/                  # Go test infrastructure
│   ├── go.mod
│   └── go.sum
│
├── README.md
├── LICENSE
└── .gitignore
```

## Configuration

All applications read their configuration from a single `login.json` file located in the main web directory:

```json
{
    "login": {
        "appTitle": "Security Console",
        "appDescription": "User & Role Management System",
        "authEndpoint": "/auth",
        "redirectUrl": "../",
        "showRememberMe": true,
        "sessionTimeout": 30,
        "tfaEnabled": true
    },
    "api": {
        "prefix": "/probler",
        "usersPath": "/73/users",
        "rolesPath": "/74/roles",
        "registryPath": "/registry"
    }
}
```

### Configuration Options

| Section | Option | Description |
|---------|--------|-------------|
| login | appTitle | Application title displayed on login screen |
| login | appDescription | Subtitle displayed below the title |
| login | authEndpoint | Authentication API endpoint |
| login | redirectUrl | URL to redirect after successful login |
| login | showRememberMe | Show "Remember me" checkbox |
| login | sessionTimeout | Session timeout in minutes (0 = disabled) |
| login | tfaEnabled | Enable TFA support |
| api | prefix | API endpoint prefix for the backend |
| api | usersPath | Path to users endpoint |
| api | rolesPath | Path to roles endpoint |
| api | registryPath | Path to registry endpoint |

## API Endpoints

### Authentication

| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/auth` | POST | `{"user":"<username>","pass":"<password>"}` | `{"token":"<bearer>"}` |
| `/tfaSetup` | POST | `{"userId":"<user>"}` | `{"secret":"<secret>","qr":"<base64>"}` |
| `/tfaSetupVerify` | POST | `{"userId":"<user>","code":"<code>","bearer":"<bearer>"}` | `{"ok":true/false}` |
| `/tfaVerify` | POST | `{"userId":"<user>","code":"<code>","bearer":"<bearer>"}` | `{"ok":true/false}` |

**Auth Response Variants:**
- Standard: `{"token":"<bearer>"}`
- TFA Required: `{"token":"<bearer>","needTfa":true}`
- TFA Setup Required: `{"token":"<bearer>","setupTfa":true}`

### Users & Roles

All endpoints require `Authorization: Bearer <token>` header.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `{prefix}{usersPath}` | GET | Fetch all users |
| `{prefix}{usersPath}` | POST | Create new user |
| `{prefix}{usersPath}` | PATCH | Update existing user |
| `{prefix}{usersPath}/{id}` | DELETE | Delete user |
| `{prefix}{rolesPath}` | GET | Fetch all roles |
| `{prefix}{rolesPath}` | POST | Create new role |
| `{prefix}{rolesPath}` | PATCH | Update existing role |
| `{prefix}{rolesPath}/{id}` | DELETE | Delete role |
| `{registryPath}` | GET | Fetch element types for rules |

## Installation

1. Clone the repository:
```bash
git clone https://github.com/saichler/l8secureui.git
cd l8secureui
```

2. Configure the application by editing `go/ui/web/login.json`

3. Add your logo files (optional):
   - `go/ui/web/login/logo.gif` - Your application logo
   - `go/ui/web/login/Layer8Logo.gif` - Layer 8 ecosystem logo

4. Serve the web application from `go/ui/web/` directory

## Usage

### Authentication Flow

1. User navigates to the application
2. If no valid token exists, redirected to login page
3. User enters credentials
4. If TFA is required:
   - **New TFA setup**: QR code displayed for authenticator app
   - **Existing TFA**: Enter 6-digit code from authenticator
5. On success, bearer token stored and user redirected to main app

### Managing Users

1. Click "Add User" to create a new user
2. Fill in User ID, Full Name, and Password
3. Select roles to assign
4. Click "Save"

### Managing Roles

1. Click "Add Role" to create a new role
2. Enter Role ID and Role Name
3. Add rules by clicking "Add Rule":
   - Set Rule ID
   - Select Element Type (from registry)
   - Choose Allow/Deny
   - Add Actions (GET, POST, PUT, PATCH, DELETE, ALL)
   - Add custom Attributes if needed
4. Click "Save"

## Development

### Running Tests

```bash
cd go
./test.sh
```

### Dependencies

The Go backend integrates with the Layer 8 ecosystem:
- `l8bus` - Event bus and overlay networking
- `l8test` - Test infrastructure
- `l8types` - Type definitions
- `l8utils` - Utility libraries
- `l8web` - REST server implementation

## Security Features

- **Bearer Token Authentication**: Stateless API authentication
- **Two-Factor Authentication**: TOTP-based with QR code setup
- **Session Management**: Configurable timeout with activity tracking
- **Role-Based Access Control**: Fine-grained permission management
- **Secure Token Storage**: LocalStorage with proper cleanup on logout

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is part of the Layer 8 Ecosystem.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues and feature requests, please use the GitHub issue tracker.
