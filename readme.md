# How to setup
1. Install all node modules with `yarn install`

2. Update database connections in `database.json`

3. Log into mysql client with `mysql -u root`

4. Create a new database user with the following commands
```
CREATE USER 'foo'@'%' IDENTIFIED WITH mysql_native_password BY 'bar';
grant all privileges on *.* to 'foo'@'%';

FLUSH PRIVILEGES;
```

5. Create a new database named `organic`

6. Exit mysql client (or open a new terminal)

7. Install nodemon with `npm install -g nodemon`

8. Add permission to run ./db-migrate.sh with `chmod +x ./db-migrate.sh

9. Run all migrations with `./db-migrate.sh up`

10. Add in dummy categories, brands and products as needed.


