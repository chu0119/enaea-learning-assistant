# Contributing to ENAEA Learning Assistant

Thank you for your interest in contributing to ENAEA Learning Assistant! This document provides guidelines and information about contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/your-username/enaea-learning-assistant.git
   cd enaea-learning-assistant
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/chu0119/enaea-learning-assistant.git
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check [existing issues](https://github.com/chu0119/enaea-learning-assistant/issues) to avoid duplicates.

When creating a bug report, include:

1. **Clear title** - Use a descriptive title
2. **Description** - A clear and concise description of the bug
3. **Steps to reproduce** - Step-by-step instructions to reproduce the behavior
4. **Expected behavior** - What you expected to happen
5. **Screenshots** - If applicable, add screenshots
6. **Environment details**:
   - Browser and version
   - Tampermonkey version
   - Operating system
   - Script version

### Suggesting Features

Feature suggestions are welcome! Please:

1. Check if the feature already exists or has been suggested
2. Create a new issue with the `[FEATURE]` label
3. Provide a clear description of the feature
4. Explain why this feature would be useful
5. Provide examples of how it would work

## Development Setup

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge)
- Tampermonkey browser extension
- Git
- A code editor (VS Code, Sublime Text, etc.)

### Local Development

1. **Install Tampermonkey** if you haven't already

2. **Enable Developer Mode** in Tampermonkey:
   - Open Tampermonkey dashboard
   - Go to Settings
   - Enable "Allow scripts to be edited"

3. **Create a new script** in Tampermonkey:
   - Click "+" to create new script
   - Paste the contents of `enaea-auto-player.js`
   - Save the script

4. **Make your changes** in the Tampermonkey editor or your local editor

5. **Test your changes** on the target website

## Pull Request Process

1. **Update documentation** if needed
2. **Test your changes** thoroughly
3. **Commit your changes** with a clear message:
   ```bash
   git commit -m "feat: Add new feature description"
   ```
   Use conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub:
   - Provide a clear title and description
   - Reference any related issues
   - Include screenshots if applicable
   - Ensure all checks pass

## Style Guidelines

### JavaScript Style

- Use `const` and `let` instead of `var`
- Use arrow functions where appropriate
- Use template literals for string interpolation
- Use meaningful variable and function names
- Add comments for complex logic
- Follow the existing code structure

### Code Organization

- Keep functions focused and small
- Group related functionality together
- Use descriptive section headers
- Maintain consistent indentation (4 spaces)

### Documentation

- Update README.md if adding new features
- Add JSDoc comments for new functions
- Keep comments up-to-date

## Reporting Bugs

When reporting bugs, please include:

1. **Title**: Brief description of the issue
2. **Description**: Detailed explanation of the problem
3. **Steps to Reproduce**: How to trigger the bug
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Screenshots**: Visual evidence if applicable
7. **Environment**: Browser, OS, script version

## Suggesting Features

When suggesting features:

1. **Title**: Clear feature name
2. **Description**: What the feature should do
3. **Use Case**: Why this feature is needed
4. **Implementation Ideas**: If you have suggestions

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with the `[QUESTION]` label
- Start a discussion on GitHub
- Reach out to the maintainers

## Thank You!

Thank you for contributing to ENAEA Learning Assistant! Your help is appreciated.
