FROM python
WORKDIR /app/
RUN pip install falcon
RUN pip install falcon-cors
COPY . .
CMD ["python", "server.py"]
