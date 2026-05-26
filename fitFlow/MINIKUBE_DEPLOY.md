# Despliegue local en Kubernetes con Minikube

Guia para macOS Apple Silicon M1/M2/M3.

## 1. Entrar al proyecto

```bash
cd /Users/joaquinchacon/Documents/Projects/fit-flow/FitFlow/fitFlow
```

## 2. Iniciar Minikube

```bash
minikube start --driver=docker
```

## 3. Usar el Docker daemon de Minikube

Este paso es importante para que las imagenes se construyan dentro de Minikube.

```bash
eval $(minikube docker-env)
```

Verifica que ahora estas apuntando a Docker de Minikube:

```bash
docker images
```

## 4. Construir imagen del backend

```bash
docker build -t fitflow-backend:local -f backend/Dockerfile .
```

## 5. Construir imagen del frontend

```bash
docker build -t fitflow-frontend:local ./front-react/doc
```

## 6. Aplicar ConfigMap

```bash
kubectl apply -f k8s/configmap.yaml
```

## 7. Aplicar backend

```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
```

El Deployment crea automaticamente su ReplicaSet.

## 8. Aplicar frontend

```bash
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

## 9. Ver evidencias del despliegue

```bash
kubectl get pods
kubectl get deployments
kubectl get replicasets
kubectl get services
```

## 10. Acceder desde el navegador

Opcion recomendada:

```bash
minikube service frontend-service
```

O, si quieres ver la URL:

```bash
minikube service frontend-service --url
```

El servicio tambien define `nodePort: 30080`, pero en macOS con Docker Desktop normalmente es mas confiable usar `minikube service`.

## 11. Escalar deployments

Escalar backend a 5 replicas:

```bash
kubectl scale deployment backend-deployment --replicas=5
```

Escalar frontend a 5 replicas:

```bash
kubectl scale deployment frontend-deployment --replicas=5
```

Verificar:

```bash
kubectl get pods
kubectl get deployments
kubectl get replicasets
```

## 12. Eliminar todo

```bash
kubectl delete -f k8s/frontend-service.yaml
kubectl delete -f k8s/frontend-deployment.yaml
kubectl delete -f k8s/backend-service.yaml
kubectl delete -f k8s/backend-deployment.yaml
kubectl delete -f k8s/configmap.yaml
```

## Notas importantes

- Los manifiestos usan `imagePullPolicy: Never`, porque las imagenes se construyen localmente dentro de Minikube.
- Las imagenes base son multi-arch y compatibles con ARM64: `python:3.12-slim-bookworm`, `node:22-bookworm` y `nginx:1.27-bookworm`.
- El backend usa SQLite por defecto. Al escalar a multiples replicas, cada pod puede tener su propia base SQLite local; esto sirve para evidencias de Kubernetes, pero para un despliegue real conviene usar PostgreSQL o MySQL externo al pod.
- El frontend usa Nginx como proxy interno hacia `http://backend-service:8000`, por eso las llamadas del navegador funcionan desde el NodePort sin depender de `localhost:8000`.
