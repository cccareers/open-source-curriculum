# Contributing to Open Source Curriculum

First off, thank you for considering contributing to the Open Source Curriculum! It's people like you that make this community a great place to learn and build technology careers. We welcome contributions from educators, developers, and learners.

## What to Contribute

- **Curriculum Content:** Fixing typos, updating outdated information, adding new modules, or creating entirely new courses.
- **Course Player & Tooling:** Fixing bugs in the player, adding new MDX components, or improving the frontend design.
- **Assessments & Exercises:** We are always looking for better, more interactive ways for learners to test their knowledge.

## Setting Expectations

We are a small but dedicated team maintaining this repository. **Please be patient** as it may take some time for us to review your issues and pull requests. We promise we will get to them! All PRs are welcome and appreciated.

## Getting Started

1. Fork the repository and clone it locally.
2. Run `npm install` to install any necessary dependencies.
3. Run `npm test` to ensure all existing tests pass.
4. Run `npm run start` to boot up the course player and browse the content.

## Development Guidelines

### Test-Driven Development (TDD)

We strongly encourage a **Test-Driven Development** approach, especially for code contributions to the course player, scanners, and parsers. 

- **Unit Tests:** All new features and bug fixes should include unit tests. We use standard JS testing frameworks. You can run unit tests with `npm test`.
- **End-to-End Tests:** As the platform grows, we are adding more e2e tests to verify user flows. If you are touching the frontend UI, please consider how it affects end-to-end functionality.
- **Projects & Curriculum:** If you are adding a new coding project to the curriculum, ensure it includes an automated test suite that learners can run to verify their solution.

### Making Changes

1. Create a new branch for your feature or bugfix: `git checkout -b feature/your-feature-name`.
2. Write your tests (they should fail initially).
3. Write the code to make your tests pass.
4. Update the documentation or README if necessary.
5. Commit your changes with clear, descriptive commit messages.
6. Push to your fork and submit a Pull Request!

## Reporting Issues

If you find a bug, have a feature request, or see an area of the curriculum that needs improvement, please open an issue.

We have provided issue templates to help you structure your request. Please use them!

## Submitting Pull Requests

When you are ready to submit a PR, please use our Pull Request template. Ensure that:
- Your code passes `npm test`.
- You have added tests for your new feature or bugfix.
- Your PR description clearly explains *why* this change is needed and *how* it was implemented.

We look forward to your contributions!
