# Job Search Assistant - Deployment Guide

This guide provides instructions for deploying the Job Search Assistant application to a production environment.

## Prerequisites

Before deploying the application, ensure you have the following:

1. **Frontend Requirements**:
   - Node.js (v16 or higher)
   - npm (v7 or higher)

2. **Backend Requirements**:
   - Python 3.10 or higher
   - pip (latest version)
   - Virtual environment tool (venv, conda, etc.)

3. **API Keys**:
   - OpenAI API key
   - SerpAPI key (for web searches)
   - SendGrid API key (for email functionality)

## Deployment Steps

### Backend Deployment

1. **Set up Python environment**:
   ```bash
   # Create a virtual environment
   python -m venv venv
   
   # Activate the virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install dependencies**:
   ```bash
   pip install fastapi uvicorn python-dotenv langchain openai langchain-community python-multipart fpdf sendgrid
   ```

3. **Configure environment variables**:
   Create a `.env` file in the backend directory with the following content:
   ```
   OPENAI_API_KEY=your_openai_api_key
   SERPAPI_API_KEY=your_serpapi_key
   SENDGRID_API_KEY=your_sendgrid_key
   EMAIL_FROM=your_email@example.com
   ```

4. **Start the backend server**:
   ```bash
   # Development
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   
   # Production
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### Frontend Deployment

1. **Set up the project**:
   ```bash
   # Create a new React project with Vite
   npm create vite@latest frontend -- --template react-ts
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   npm install react-router-dom axios
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Copy source files**:
   Copy all files from the `frontend-src` directory to your project's `src` directory.

4. **Configure Tailwind CSS**:
   Update `tailwind.config.js` with the following content:
   ```javascript
   /** @type {import('tailwindcss').Config} */
   export default {
     content: [
       "./index.html",
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

6. **Deploy the build**:
   The production build will be in the `dist` directory. You can deploy this to any static file hosting service like Netlify, Vercel, or a traditional web server.

## Production Deployment Options

### Option 1: Traditional Server Deployment

1. **Backend**:
   - Deploy the FastAPI application using Gunicorn or Uvicorn behind a reverse proxy like Nginx
   - Set up process management with Supervisor or systemd

2. **Frontend**:
   - Deploy the built static files to a web server like Nginx or Apache
   - Configure the web server to serve the static files and proxy API requests to the backend

### Option 2: Container Deployment

1. **Create Dockerfiles**:
   
   **Backend Dockerfile**:
   ```dockerfile
   FROM python:3.10-slim
   
   WORKDIR /app
   
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   COPY *.py .
   COPY .env .
   
   EXPOSE 8000
   
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```
   
   **Frontend Dockerfile**:
   ```dockerfile
   FROM node:16-alpine as build
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm install
   
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   
   EXPOSE 80
   
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Deploy with Docker Compose**:
   Create a `docker-compose.yml` file:
   ```yaml
   version: '3'
   
   services:
     backend:
       build: ./backend
       ports:
         - "8000:8000"
       environment:
         - OPENAI_API_KEY=${OPENAI_API_KEY}
         - SERPAPI_API_KEY=${SERPAPI_API_KEY}
         - SENDGRID_API_KEY=${SENDGRID_API_KEY}
         - EMAIL_FROM=${EMAIL_FROM}
     
     frontend:
       build: ./frontend
       ports:
         - "80:80"
       depends_on:
         - backend
   ```

### Option 3: Cloud Platform Deployment

1. **AWS**:
   - Deploy the backend on AWS Lambda or ECS
   - Host the frontend on S3 with CloudFront

2. **Google Cloud Platform**:
   - Deploy the backend on Cloud Run or App Engine
   - Host the frontend on Firebase Hosting

3. **Microsoft Azure**:
   - Deploy the backend on Azure Functions or App Service
   - Host the frontend on Azure Static Web Apps

## Monitoring and Maintenance

1. **Set up logging**:
   - Implement structured logging in the backend
   - Use a service like Sentry for error tracking

2. **Performance monitoring**:
   - Monitor API response times
   - Track OpenAI API usage to manage costs

3. **Regular updates**:
   - Keep dependencies up to date
   - Implement CI/CD for automated testing and deployment

## Security Considerations

1. **API Key Protection**:
   - Never expose API keys in the frontend code
   - Use environment variables for sensitive information

2. **CORS Configuration**:
   - Configure CORS to only allow requests from trusted domains

3. **Rate Limiting**:
   - Implement rate limiting to prevent abuse

4. **Input Validation**:
   - Validate all user inputs on both frontend and backend

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure the backend has proper CORS configuration
   - Check that the frontend is making requests to the correct URL

2. **API Key Issues**:
   - Verify that all API keys are correctly set in the environment variables
   - Check API key permissions and quotas

3. **Deployment Failures**:
   - Check server logs for detailed error messages
   - Verify that all dependencies are correctly installed

For additional support, refer to the technical documentation or contact the development team.
