# Informe: Despliegue de aplicación full-stack en Kubernetes con Minikube

## 1. Datos generales

**Asignatura:** Desarrollo / Contenedores / Kubernetes  
**Trabajo:** Despliegue de aplicaciones Docker en Kubernetes local  
**Modalidad:** Grupal  
**Proyecto:** FitFlow  
**Entorno:** macOS Apple Silicon M1/M2/M3, Docker, Minikube y kubectl

## 2. Objetivo

Desplegar las aplicaciones creadas previamente con Docker dentro de un clúster local de Kubernetes utilizando Minikube, aplicando objetos `Deployment`, `ReplicaSet`, `Pod` y `Service`. Además, se debe demostrar el funcionamiento de los servicios y el escalamiento de réplicas.

## 3. Descripción del proyecto

FitFlow es una aplicación full-stack compuesta por:

- **Frontend:** React con Vite, servido mediante Nginx.
- **Backend:** API desarrollada con FastAPI y ejecutada con Uvicorn.
- **Base de datos:** SQLite local para el entorno de prueba.
- **Clúster:** Kubernetes local usando Minikube.

El frontend se expone hacia el navegador mediante un Service de tipo `NodePort`. Internamente, el frontend usa Nginx como proxy para comunicarse con el backend mediante el nombre DNS del servicio interno `backend-service`.

## 4. Arquitectura del despliegue

La arquitectura implementada es la siguiente:

```text
Navegador
   |
   | NodePort 30080
   v
frontend-service
   |
   v
frontend-deployment
   |
   | Proxy Nginx hacia http://backend-service:8000
   v
backend-service
   |
   v
backend-deployment
   |
   v
Pods del backend FastAPI
```

## 5. Objetos Kubernetes utilizados

### 5.1 Pod

Un `Pod` es la unidad mínima de ejecución en Kubernetes. En este proyecto, los Pods contienen los contenedores del frontend y del backend.

**Uso:** ejecutar una instancia de una aplicación dentro del clúster.

### 5.2 Deployment

Un `Deployment` administra el ciclo de vida de los Pods. Permite crear, actualizar, reiniciar y escalar aplicaciones de forma controlada.

**Usos principales:**

- Mantener una cantidad deseada de réplicas.
- Actualizar una aplicación sin borrar manualmente los Pods.
- Recuperar Pods automáticamente si fallan.
- Facilitar el escalamiento horizontal.

En este proyecto se crearon dos Deployments:

- `backend-deployment`
- `frontend-deployment`

### 5.3 ReplicaSet

Un `ReplicaSet` garantiza que exista siempre un número específico de Pods ejecutándose. Aunque no se crea manualmente en este proyecto, Kubernetes lo genera automáticamente cuando se aplica un Deployment.

**Usos principales:**

- Mantener disponibilidad de la aplicación.
- Reemplazar Pods que fallan.
- Soportar escalamiento de réplicas.

### 5.4 Service

Un `Service` permite exponer y comunicar aplicaciones dentro o fuera del clúster.

En este proyecto se usaron:

- `backend-service`: tipo `ClusterIP`, para comunicación interna dentro del clúster.
- `frontend-service`: tipo `NodePort`, para acceder al frontend desde el navegador.

## 6. Archivos creados

### 6.1 Dockerfiles

Se crearon o ajustaron los siguientes Dockerfiles:

- `backend/Dockerfile`
- `front-react/doc/Dockerfile`

Las imágenes base utilizadas son compatibles con ARM64:

- `python:3.12-slim-bookworm`
- `node:22-bookworm`
- `nginx:1.27-bookworm`

### 6.2 Archivos YAML de Kubernetes

Los manifiestos Kubernetes se encuentran en la carpeta `k8s/`:

- `k8s/configmap.yaml`
- `k8s/backend-deployment.yaml`
- `k8s/backend-service.yaml`
- `k8s/frontend-deployment.yaml`
- `k8s/frontend-service.yaml`

Todos los Deployments usan:

```yaml
imagePullPolicy: Never
```

Esto permite que Kubernetes use las imágenes construidas localmente dentro del Docker daemon de Minikube.

## 7. Comandos ejecutados

### 7.1 Iniciar Minikube

```bash
minikube start --driver=docker
```

### 7.2 Usar el Docker daemon de Minikube

```bash
eval $(minikube docker-env)
```

### 7.3 Construir imagen del backend

```bash
docker build -t fitflow-backend:local -f backend/Dockerfile .
```

### 7.4 Construir imagen del frontend

```bash
docker build -t fitflow-frontend:local ./front-react/doc
```

### 7.5 Aplicar manifiestos YAML

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

## 8. Evidencia de Pods funcionando

Comando:

```bash
kubectl get pods
```

Evidencia esperada:

```text
NAME                                   READY   STATUS    RESTARTS   AGE
backend-deployment-xxxxxxxxxx-xxxxx    1/1     Running   0          Xm
backend-deployment-xxxxxxxxxx-xxxxx    1/1     Running   0          Xm
frontend-deployment-xxxxxxxxxx-xxxxx   1/1     Running   0          Xm
frontend-deployment-xxxxxxxxxx-xxxxx   1/1     Running   0          Xm
```

**Captura o salida obtenida:**

```text
Pegar aqui la salida real de kubectl get pods.
```

## 9. Evidencia de Deployments funcionando

Comando:

```bash
kubectl get deployments
```

Evidencia esperada:

```text
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
backend-deployment    2/2     2            2           Xm
frontend-deployment   2/2     2            2           Xm
```

**Captura o salida obtenida:**

```text
Pegar aqui la salida real de kubectl get deployments.
```

## 10. Evidencia de ReplicaSets

Comando:

```bash
kubectl get replicasets
```

Evidencia esperada:

```text
NAME                             DESIRED   CURRENT   READY   AGE
backend-deployment-xxxxxxxxxx    2         2         2       Xm
frontend-deployment-xxxxxxxxxx   2         2         2       Xm
```

**Captura o salida obtenida:**

```text
Pegar aqui la salida real de kubectl get replicasets.
```

## 11. Evidencia de Services funcionando

Comando:

```bash
kubectl get services
```

Evidencia esperada:

```text
NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
backend-service    ClusterIP   xx.xx.xx.xx     <none>        8000/TCP       Xm
frontend-service   NodePort    xx.xx.xx.xx     <none>        80:30080/TCP   Xm
kubernetes         ClusterIP   xx.xx.xx.xx     <none>        443/TCP        Xm
```

**Captura o salida obtenida:**

```text
Pegar aqui la salida real de kubectl get services.
```

## 12. Evidencia de acceso desde navegador

Para abrir el frontend:

```bash
minikube service frontend-service
```

O para obtener la URL:

```bash
minikube service frontend-service --url
```

**Evidencia esperada:** navegador mostrando la aplicación FitFlow.

**Captura obtenida:**

```text
Insertar aqui una captura de la aplicacion abierta desde la URL de Minikube.
```

## 13. Evidencia de escalamiento

### 13.1 Escalar backend a 5 réplicas

Comando:

```bash
kubectl scale deployment backend-deployment --replicas=5
```

Verificación:

```bash
kubectl get deployments
kubectl get pods
kubectl get replicasets
```

Evidencia esperada:

```text
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
backend-deployment    5/5     5            5           Xm
frontend-deployment   2/2     2            2           Xm
```

### 13.2 Escalar frontend a 5 réplicas

Comando:

```bash
kubectl scale deployment frontend-deployment --replicas=5
```

Verificación:

```bash
kubectl get deployments
kubectl get pods
kubectl get replicasets
```

Evidencia esperada:

```text
NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
backend-deployment    5/5     5            5           Xm
frontend-deployment   5/5     5            5           Xm
```

**Captura o salida obtenida luego del escalamiento:**

```text
Pegar aqui la salida real de los comandos de escalamiento.
```

## 14. Contenido de los archivos YAML

### 14.1 `k8s/configmap.yaml`

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fitflow-config
data:
  DATABASE_URL: "sqlite:///./fitflow.db"
  APP_ENV: "local-minikube"
```

### 14.2 `k8s/backend-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
  labels:
    app: fitflow-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: fitflow-backend
  template:
    metadata:
      labels:
        app: fitflow-backend
    spec:
      containers:
        - name: backend
          image: fitflow-backend:local
          imagePullPolicy: Never
          ports:
            - containerPort: 8000
          envFrom:
            - configMapRef:
                name: fitflow-config
```

### 14.3 `k8s/backend-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  labels:
    app: fitflow-backend
spec:
  type: ClusterIP
  selector:
    app: fitflow-backend
  ports:
    - name: http
      port: 8000
      targetPort: 8000
```

### 14.4 `k8s/frontend-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
  labels:
    app: fitflow-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: fitflow-frontend
  template:
    metadata:
      labels:
        app: fitflow-frontend
    spec:
      containers:
        - name: frontend
          image: fitflow-frontend:local
          imagePullPolicy: Never
          ports:
            - containerPort: 80
```

### 14.5 `k8s/frontend-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  labels:
    app: fitflow-frontend
spec:
  type: NodePort
  selector:
    app: fitflow-frontend
  ports:
    - name: http
      port: 80
      targetPort: 80
      nodePort: 30080
```

## 15. Conclusiones

Se logró preparar el despliegue de la aplicación FitFlow en Kubernetes local usando Minikube. El proyecto cuenta con imágenes Docker para frontend y backend, manifiestos YAML para Deployments y Services, y configuración para escalar réplicas mediante Kubernetes.

El uso de `Deployment` permite administrar actualizaciones, disponibilidad y escalamiento de la aplicación. El `ReplicaSet`, generado automáticamente por el Deployment, asegura que se mantenga la cantidad deseada de Pods funcionando. Finalmente, los `Services` permiten la comunicación interna entre componentes y el acceso externo al frontend mediante NodePort.

## 16. Anexos

Archivos entregables:

- `backend/Dockerfile`
- `front-react/doc/Dockerfile`
- `k8s/configmap.yaml`
- `k8s/backend-deployment.yaml`
- `k8s/backend-service.yaml`
- `k8s/frontend-deployment.yaml`
- `k8s/frontend-service.yaml`
- `MINIKUBE_DEPLOY.md`
- `INFORME_KUBERNETES_MINIKUBE.md`
