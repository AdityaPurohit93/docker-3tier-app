FROM mysql:8.0

ENV MYSQL_ROOT_PASSWORD=rootpassword

ENV MYSQL_DATABASE=appdb

COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 3306

CMD ["mysqld"]