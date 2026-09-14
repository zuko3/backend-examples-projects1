# Event booking

## Quickstart

```go
go mod init example.com/rest-api
```

```go
go get -u github.com/gin-gonic/gin
```

```go
package main

import "github.com/gin-gonic/gin"

func main() {
	server := gin.Default()
	server.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	server.Run() // listens on 0.0.0.0:8080 by default
}
```

```go
❌ Problem
`binding: "required"`

✅ Correct
`binding:"required"`
```

```go
go get github.com/mattn/go-sqlite3
```

```go
go get -u golang.org/x/crypto
```

```go
go get -u github.com/golang-jwt/jwt/v5
```

```go
The := operator requires at least one new variable on the left-hand side.
```

```js
http://127.0.0.1:8080/event

{
	"name": "event1",
	"description" :"event event event",
	"location"    :"event",
	"datetime"    :"2026-03-20T15:30:00Z"
}
```

```js
http://127.0.0.1:8080/signup

{
	"email": "test@gmail.com",
	"password" :"rahul"
}
```
