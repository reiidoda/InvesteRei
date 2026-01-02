FROM eclipse-temurin:21-jdk as build
WORKDIR /workspace
COPY . .
RUN docker run --rm -v "$(pwd)":/ws -w /ws maven:3.9-eclipse-temurin-21 mvn -q -DskipTests package
# If Docker-in-Docker isn't allowed, build with:
#   docker run --rm -v "$(pwd)":/ws -w /ws maven:3.9-eclipse-temurin-21 mvn -q -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/portfolio-service.jar /app/app.jar
EXPOSE 8082
ENTRYPOINT ["java","-jar","/app/app.jar"]
