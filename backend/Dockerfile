FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for asyncpg and ML libraries
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt

COPY . .

# Expose FastAPI port
EXPOSE 8000

# Command to run FastAPI, Celery commands will be overridden in docker-compose if run separately
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
