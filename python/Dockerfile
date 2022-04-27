FROM python:3.8-slim

RUN apt-get update -y && apt-get install -y git

WORKDIR /app

COPY requirements.txt /tmp

RUN pip install -r /tmp/requirements.txt

COPY walker.py /app
COPY repositories.txt /app

ENTRYPOINT ["python", "walker.py", "-D"]
