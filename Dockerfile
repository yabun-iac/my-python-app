FROM python:3-alpine3.15
WORKDIR /usr/app
COPY . .
RUN pip install -r requirements.txt
ENTRYPOINT ["python"]
CMD ["main.py"]