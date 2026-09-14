package routes

import (
	"net/http"
	"strconv"

	"example.com/rest-api/models"
	"github.com/gin-gonic/gin"
)

func Ping(ctx *gin.Context) {
	events, err := models.GetAllEvents()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"message": "Internal server error",
			"error":   err,
		})
		return
	}
	ctx.JSON(http.StatusOK, events)
}

func CreateEvent(ctx *gin.Context) {
	var event models.Event
	//autobind event
	if err := ctx.ShouldBindBodyWithJSON(&event); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": "Bad request",
			"error":   err,
		})
	} else {
		userId := ctx.GetInt64("userId")
		event.UserId = userId
		err := event.Save()
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"message": "Internal server error",
				"error":   err,
			})
			return
		}
		ctx.JSON(http.StatusCreated, gin.H{
			"message": "Event created",
			"event":   event,
		})
	}

}

func GetEvents(ctx *gin.Context) {
	events, err := models.GetAllEvents()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"message": "Internal server error",
			"error":   err,
		})
		return
	}
	ctx.JSON(http.StatusOK, events)
}

func GetEventByID(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": "Bad Request cannot parse id",
			"error":   err,
		})
		return
	}
	event, err := models.GetEventByID(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"message": "Couldnot fetch event",
			"error":   err,
		})
		return
	}
	ctx.JSON(http.StatusOK, *event)
}

func UpdateEvent(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": "Bad Request cannot parse id",
			"error":   err,
		})
		return
	}

	userId := ctx.GetInt64("userId")
	event, err := models.GetEventByID(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"message": "Internal serverID",
			"error":   err,
		})
		return
	}

	if userId != event.UserId {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"message": "Not authorized to update events",
		})
		return
	}

	var upadatedEvent models.Event
	err = ctx.ShouldBindBodyWithJSON(&upadatedEvent)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": "Couldnot parse updated data",
			"error":   err,
		})
		return
	}

	upadatedEvent.ID = id
	err = upadatedEvent.Update()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"message": "Error updating event",
			"error":   err,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"message": "Event Updated",
	})

}

func DeleteEvent(ctx *gin.Context) {
	id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"message": "Bad Request cannot parse id",
			"error":   err,
		})
		return
	}

	event, err := models.GetEventByID(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"message": "Internal server Error",
			"error":   err,
		})
		return
	}
	userId := ctx.GetInt64("userId")
	if userId != event.UserId {
		ctx.JSON(http.StatusUnauthorized, gin.H{
			"message": "Not authorized to delete events",
		})
		return
	}

	err = event.Delete()

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"message": "Couldn't Delete Event",
			"error":   err,
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Event Deleted",
	})

}
