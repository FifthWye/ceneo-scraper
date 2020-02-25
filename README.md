# ceneo-scraper
 
To run:
```
npm start
```

Bull needs the Redis service to store and manage its jobs and messages. So, I installed Redis using Docker:
```
docker run -d -p 6379:6379 --name redis1 redis
```

then

```
docker exec -it redis1 sh
```

and
```
redis-cli -h redis
```