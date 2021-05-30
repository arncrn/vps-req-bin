FROM node:12.16.2

WORKDIR /code

# ENV PORT 3000

# ENV DB_CONNECTIONSTRING postgresql://docker:secret@psql/reqbin

# ENV USER docker
# ENV POSTGRES_PASSWORD secret

# ENV HOST localhost

COPY package.json /code/package.json

RUN npm install

COPY . /code

CMD ["node", "server.js"]


#1  docker network create reqbin-app
  # creates a network called "rebbin-app"

#2  docker run -d --network reqbin-app --network-alias psql -v "$(pwd):/var/lib/postgresql" -v "$(pwd)/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql" -e POSTGRES_PASSWORD=secret -e POSTGRES_USER=docker -e POSTGRES_DB=reqbin postgres:13.3
  # -d: detached
  # --network reqbin-app : connects to the reqbin-app network
  # --network-alias psql : maps the database's ip-address to the string psql
  # -v "$(pwd):/var/lib/postgresql" : creates a bind-mount.  the current dirctory is where data is linked to/pulled from
  # -v "$(pwd)/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql" : creates a bind-mount.  data from $(pwd)/database/schema.sql is referenced during initdb, which builds the database schema.

#3  docker exec -it 4c763 psql -U docker -d reqbin
  # lets you go into the psql database to verify that everything worked

#4  docker run -dp 3000:3000 --network reqbin-app -w /code -v "$(pwd):/code" -e HOST=localhost -e POSTGRES_PASSWORD=secret -e USER=docker -e PORT=3000 -e DB_CONNECTIONSTRING=postgresql://docker:secret@psql/reqbin node:12-alpine sh -c "npm install && npm start"
  # creates an application from the current directory, links it to the reqbin-app network, installs the dependencies, and runs the given script.



# ============= first attempt (outdated) below =================



# docker run -d --network reqbin --network-alias psql -v reqbin-psql-data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=secret -e POSTGRES_USER=docker -e POSTGRES_DB=reqbin postgres:13.3

# docker exec -it 4c763 psql -U docker -d reqbin

# copy data/files from your directory into the docker container (not needed)
# docker cp database/schema.sql amazing_liskov:/docker-entrypoint-initdb.d/schema.sql
# (docker cp ./localfile.sql containername:/container/path/file.sql)

# execute a command on a file located in a container (not needed)
# docker exec -it 889f psql -U docker -d reqbin -f docker-entrypoint-initdb.d/schema.sql
# (docker exec -it containername psql -U postgresuser -d dbname -f /container/path/file.sql)
