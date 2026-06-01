FROM python:3.11-slim

WORKDIR /app

COPY fitFlow/requirements.txt /app/requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY fitFlow /app/fitFlow

EXPOSE 8000

CMD ["uvicorn", "fitFlow.main:app", "--host", "0.0.0.0", "--port", "8000"]