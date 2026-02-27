FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ping_worker.py .

CMD ["python", "ping_worker.py"]
