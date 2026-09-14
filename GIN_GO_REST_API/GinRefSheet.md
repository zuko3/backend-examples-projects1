# Gin Sheet (API Development)

```go
https://gin-gonic.com/en/docs/introduction/
```

1. Installation:
   - Install Gin using the command: `go get -u github.com/gin-gonic/gin`

2. Importing Gin:
   - Import the Gin package in your Go program: `import "github.com/gin-gonic/gin"`

3. Creating a Router:
   - Create a new router instance: `router := gin.Default()`

4. Handling HTTP Requests:
   - Define a route and its handler function using the `GET`, `POST`, `PUT`, `DELETE`, or other HTTP methods.
   - Example:
     ```go
     router.GET("/users", func(c *gin.Context) {
         c.JSON(http.StatusOK, gin.H{"message": "Get all users"})
     })
     ```

5. Request Parameters:
   - Access query parameters using `c.Query("param")`.
   - Access route parameters using `c.Param("param")`.
   - Access form data using `c.PostForm("param")`.
   - Example:
     ```go
     router.GET("/users/:id", func(c *gin.Context) {
         id := c.Param("id")
         c.JSON(http.StatusOK, gin.H{"message": "Get user with ID " + id})
     })
     ```

6. JSON Responses:
   - Return JSON responses using `c.JSON(statusCode, data)`.
   - Example:
     ```go
     router.GET("/users", func(c *gin.Context) {
         users := []string{"John", "Jane", "Bob"}
         c.JSON(http.StatusOK, users)
     })
     ```

7. Middleware:
   - Use middleware functions to perform actions before or after handling requests.
   - Example:
     ```go
     router.Use(gin.Logger())
     router.Use(gin.Recovery())
     ```

8. Grouping Routes:
   - Group related routes using `router.Group()`.
   - Example:
     ```go
     v1 := router.Group("/api/v1")
     {
         v1.GET("/users", func(c *gin.Context) {
             c.JSON(http.StatusOK, gin.H{"message": "Get all users"})
         })
         v1.GET("/users/:id", func(c *gin.Context) {
             id := c.Param("id")
             c.JSON(http.StatusOK, gin.H{"message": "Get user with ID " + id})
         })
     }
     ```

9. Error Handling:
   - Handle errors using `c.AbortWithError(statusCode, err)`.
   - Example:
     ```go
     router.GET("/users/:id", func(c *gin.Context) {
         id := c.Param("id")
         if id == "" {
             c.AbortWithError(http.StatusBadRequest, errors.New("Invalid ID"))
             return
         }
         c.JSON(http.StatusOK, gin.H{"message": "Get user with ID " + id})
     })
     ```

10. Running the Server:
    - Start the server using `router.Run(":port")`.
    - Example:
      ```go
      router.Run(":8080")
      ```
