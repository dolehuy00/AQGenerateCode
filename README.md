# Project Setup Guide

This guide will help you set up the development environment for this project on Windows.

## Prerequisites

- Python 3.x installed on your system
- pip (Python package installer)

## Setting up Virtual Environment

1. Open Command Prompt or PowerShell in your project directory

2. Create a virtual environment:
```bash
python -m venv .venv
```

3. Activate the virtual environment:
```bash
.venv\Scripts\activate
```
You should see `(.venv)` appear at the beginning of your command prompt, indicating that the virtual environment is active.

## Installing Dependencies

Once your virtual environment is activated, install the required packages:

```bash
pip install -r requirements.txt
```

## Deactivating Virtual Environment

When you're done working on the project, you can deactivate the virtual environment:

```bash
deactivate
```

## Environment Variables

1. Create a `.env` file in the project root directory
2. Add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

## Notes

- Always activate the virtual environment before working on the project
- Make sure to keep your `.env` file secure and never commit it to version control
- If you install new packages, update requirements.txt using:
```bash
pip freeze > requirements.txt
``` 