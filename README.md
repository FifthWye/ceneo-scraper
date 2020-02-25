# ceneo-scraper

To run:

```
npm start
```

To run bull-arena:

```
npm run arena
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

All arguments ( PDP urls ) are passed to app with npm script "start" if you wan't to change values just add o remove urls in package.json
