FROM golang:1.15.2-alpine as builder

WORKDIR /app

COPY go.mod ./
COPY go.sum ./

RUN go mod download

COPY main.go ./

RUN GCO_ENABLED=0 go build -ldflags="-w -s" -o /fetch-corpus

FROM scratch

COPY --from=build /fetch-corpus /fetch-corpus

CMD ["/fetch-corpus"]
