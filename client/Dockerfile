FROM python:alpine

WORKDIR /app/

EXPOSE 8001

COPY index.html .

CMD ["python3", "-m", "http.server", "8001"]