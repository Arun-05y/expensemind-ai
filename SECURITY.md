# Security Policy

## Reporting a Vulnerability

We take the security of ExpenseMind AI seriously. If you believe you have found a security vulnerability, please report it to us by opening a GitHub issue or contacting the maintainers directly.

## Supported Versions

Only the latest version of ExpenseMind AI is supported for security updates.

## Secure Development Lifecycle (SDL)

- **Input Sanitization**: All user inputs are validated and sanitized on the server side to prevent XSS and SQL/NoSQL Injection.
- **Dependency Scanning**: We use automated tools to scan for vulnerabilities in our dependencies.
- **Environment Management**: API keys and secrets are never hardcoded and are managed exclusively via environment variables.
- **Secure Headers**: The application uses `helmet` middleware to set secure HTTP headers.
- **Authentication**: Authentication is handled via Firebase, following industry-standard security protocols.

## Best Practices

- Always use the `.env.example` file to set up your environment.
- Never commit your `.env` file to version control.
- Regularly update dependencies using `npm update`.
