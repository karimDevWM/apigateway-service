<h1>ApiGateway</h1>
<h4> ce projet est un Proof Of Concept</h4>
<h2>Composante du Projet Tasks basée sur Nest JS, construit avec une architecture microservices et déployé en utilsant des images Docker.</h2>
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description
<h3>Ce service est le point d'entrée pour les clients et routeur des requêtes vers les microservices <a href="https://github.com/karimDevWM/auth-service">auth-service</a> et <a href="https://github.com/karimDevWM/tasks-service">tasks-service</a></h3>

<p>L'ApiGateway intercèpte les requêtes clients, vérifie que les données sont valides et publie un event vers le microservice qui a souscrit à cet event.
</p>

exemple du code pour la configuration de Nats et la publication de l'event :

## run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment


## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
