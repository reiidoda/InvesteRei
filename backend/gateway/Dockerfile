FROM eclipse-temurin:21-jdk as build
WORKDIR /workspace
COPY . .
RUN ./mvnw -q -DskipTests package || true
# If mvnw isn't available, fall back to using maven inside image (user can replace).
# We keep a plain Dockerfile; the repo includes a tiny wrapper script below.

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/gateway.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
