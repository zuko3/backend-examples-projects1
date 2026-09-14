package routes

import (
	"example.com/rest-api/middlewares"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(server *gin.Engine) {
	(*server).GET("/ping", Ping)
	(*server).GET("/event", GetEvents)
	(*server).GET("/event/:id", GetEventByID)

	authenticated := server.Group("/")
	authenticated.Use(middlewares.Authticates)
	authenticated.POST("/event", CreateEvent)
	authenticated.PUT("/event/:id", UpdateEvent)
	authenticated.DELETE("/event/:id", DeleteEvent)

	server.POST("/signup", CreateUser)
	server.POST("/login", Login)
}

//(*server).POST("/event", middlewares.Authticates, CreateEvent)
