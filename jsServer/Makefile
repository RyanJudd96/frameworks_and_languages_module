DOCKER_IMAGE:=server

run_local:
	python server.py

build:
	docker build --tag ${DOCKER_IMAGE} .

run:
	docker run --rm -it --publish 8000:8000 ${DOCKER_IMAGE}
