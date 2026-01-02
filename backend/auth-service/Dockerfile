FROM eclipse-temurin:21-jdk as build
WORKDIR /workspace
COPY . .
RUN docker run --rm -v "$(pwd)":/ws -w /ws maven:3.9-eclipse-temurin-21 mvn -q -DskipTests package
# NOTE: docker-in-docker won't run in all environments. If it fails, build via:
#   docker run --rm -v "$(pwd)":/ws -w /ws maven:3.9-eclipse-temurin-21 mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/auth-service.jar /app/app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app/app.jar"]
