---
title: Docker CLI
description: Portainer
icon: "material/docker"
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---

## Installation & Basics

### Verify Installation

```bash
docker --version
docker info
docker system info
```

### Help Commands

```bash
docker --help
docker <command> --help
docker help <command>
```

## Container Management

### Running Containers

```bash
# Run a container
docker run <image>
docker run -d <image>                    # Run in detached mode
docker run -it <image> /bin/bash        # Run interactively
docker run --name mycontainer <image>   # Name the container

# Run with specific options
docker run -p 8080:80 <image>           # Port mapping
docker run -v /host/path:/container/path <image>  # Volume mount
docker run -e ENV_VAR=value <image>     # Set environment variable
docker run --rm <image>                 # Remove container after exit
docker run --restart=always <image>     # Auto-restart policy
```

### Container Lifecycle

```bash
# Start/Stop/Restart
docker start <container>
docker stop <container>
docker restart <container>
docker pause <container>
docker unpause <container>

# Remove containers
docker rm <container>
docker rm -f <container>                # Force remove running container
docker container prune                  # Remove all stopped containers
```

### Container Information

```bash
# List containers
docker ps                              # Running containers
docker ps -a                           # All containers
docker ps -q                           # Only container IDs
docker ps -f "status=exited"          # Filter by status

# Container details
docker inspect <container>
docker logs <container>
docker logs -f <container>             # Follow logs
docker logs --tail 100 <container>     # Last 100 lines
docker top <container>                 # Running processes
docker stats <container>               # Resource usage
docker port <container>                # Port mappings
```

### Executing Commands

```bash
docker exec -it <container> /bin/bash   # Interactive shell
docker exec <container> <command>       # Run command
docker exec -u root <container> <command>  # Run as specific user
```

## Image Management

### Working with Images

```bash
# List images
docker images
docker image ls
docker images -a                       # All images (including intermediate)

# Pull images
docker pull <image:tag>
docker pull ubuntu:20.04

# Remove images
docker rmi <image>
docker rmi -f <image>                  # Force remove
docker image prune                     # Remove unused images
docker image prune -a                  # Remove all unused images

# Image information
docker image inspect <image>
docker image history <image>           # Show image layers
```

### Building Images

```bash
# Build from Dockerfile
docker build .
docker build -t myapp:latest .
docker build -f Dockerfile.dev .       # Specify Dockerfile

# Build with arguments
docker build --build-arg ENV=production .
docker build --no-cache .              # Build without cache

# Multi-stage builds
docker build --target build-stage .
```

### Image Operations

```bash
# Tag images
docker tag <image> newrepo/newimage:tag

# Save/Load images
docker save -o image.tar <image>
docker load -i image.tar

# Import/Export
docker export <container> > container.tar
docker import container.tar newimage:tag

# Docker image diff
docker diff <container>                # Changes in container filesystem
```

## Docker Registry Operations

### Docker Hub Operations

```bash
# Login/Logout
docker login
docker login registry.example.com
docker logout

# Push images
docker push username/repository:tag
docker push myregistry.com:5000/myimage

# Search images
docker search <term>
docker search --filter "is-official=true" <term>
```

### Private Registry

```bash
# Work with private registry
docker pull private.registry.com/image:tag
docker push private.registry.com/image:tag
docker login private.registry.com

# Registry inspection
docker manifest inspect <image>        # View image manifest
```

## Network Management

### Network Operations

```bash
# List networks
docker network ls
docker network ls --filter driver=bridge

# Create networks
docker network create mynetwork
docker network create --driver bridge mybridge
docker network create --subnet 172.20.0.0/16 mynet

# Inspect networks
docker network inspect <network>
docker network inspect bridge

# Connect containers to networks
docker network connect <network> <container>
docker network disconnect <network> <container>

# Remove networks
docker network rm <network>
docker network prune                   # Remove unused networks
```

### Network Types

```bash
# Different network drivers
docker network create --driver bridge my-bridge
docker network create --driver overlay my-overlay
docker network create --driver host my-host
docker network create --driver macvlan my-macvlan
docker network create --driver none my-none
```

## Volume Management

### Volume Operations

```bash
# List volumes
docker volume ls
docker volume ls --filter dangling=true

# Create volumes
docker volume create myvolume
docker volume create --driver local myvolume
docker volume create --opt type=nfs --opt device=:/path --opt o=addr=host mynfs

# Inspect volumes
docker volume inspect <volume>

# Remove volumes
docker volume rm <volume>
docker volume prune                    # Remove unused volumes

# Cleanup
docker system prune --volumes          # Remove all unused volumes
```

### Using Volumes

```bash
# Mount volumes in containers
docker run -v myvolume:/path <image>
docker run --mount source=myvolume,target=/path <image>
docker run -v /host/path:/container/path <image>

# Volume backup
docker run --rm -v myvolume:/volume -v $(pwd):/backup alpine \
  tar czf /backup/backup.tar.gz -C /volume ./
```

## Docker Compose

### Basic Compose Operations

```bash
# Start services
docker-compose up
docker-compose up -d                   # Detached mode
docker-compose up --build              # Build images first

# Stop services
docker-compose down
docker-compose down -v                 # Remove volumes too

# Manage services
docker-compose start
docker-compose stop
docker-compose restart

# View logs
docker-compose logs
docker-compose logs -f                 # Follow logs
docker-compose logs <service>

# Service information
docker-compose ps
docker-compose top
docker-compose config                  # Validate and view config
```

### Compose File Operations

```bash
# Specify compose files
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up

# Environment specific
docker-compose --env-file .env.production config
```

## System & Info

### System Management

```bash
# System information
docker system df                       # Disk usage
docker system events                   # Real-time events
docker system info

# Cleanup
docker system prune                    # Remove all unused data
docker system prune -a                 # Remove all unused images too
docker container prune                 # Remove stopped containers
docker image prune                     # Remove dangling images
docker network prune                   # Remove unused networks
docker volume prune                    # Remove unused volumes

# Resource management
docker update --memory 512m <container>  # Update container resources
```

### Docker Daemon

```bash
# Daemon information
docker version
docker info

# Daemon management (requires sudo)
sudo systemctl docker start
sudo systemctl docker stop
sudo systemctl docker restart
```

## Dockerfile Operations

### Build Context & Cache

```bash
# Build with specific context
docker build https://github.com/user/repo.git
docker build - < Dockerfile            # Build from stdin
docker build - < context.tar.gz

# Cache management
docker build --no-cache .
docker build --cache-from <image> .

# Build arguments
docker build --build-arg HTTP_PROXY=http://proxy.example.com .
```

### Multi-architecture Builds

```bash
# Build for multiple platforms
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 .
docker buildx build --push .           # Build and push multi-arch
```

## Security & Context

### Security Practices

```bash
# Run as non-root
docker run --user 1000:1000 <image>

# Security options
docker run --security-opt=no-new-privileges <image>
docker run --cap-drop ALL --cap-add NET_BIND_SERVICE <image>

# Read-only containers
docker run --read-only -v /tmp:/tmp <image>
```

### Docker Context

```bash
# Manage contexts
docker context ls
docker context create remote --docker "host=ssh://user@server"
docker context use remote
docker context rm remote
```

## Advanced Operations

### Container Resource Management

```bash
# Resource limits
docker run --memory=512m <image>
docker run --memory-reservation=256m <image>
docker run --cpus=1.5 <image>
docker run --cpuset-cpus="0-3" <image>
docker run --blkio-weight=500 <image>

# Restart policies
docker run --restart=no <image>
docker run --restart=on-failure <image>
docker run --restart=unless-stopped <image>
docker run --restart=always <image>
```

### Health Checks

```bash
# Container health
docker run --health-cmd="curl -f http://localhost/ || exit 1" \
           --health-interval=30s \
           --health-timeout=10s \
           --health-retries=3 \
           <image>
```

### Docker Swarm (Basic)

```bash
# Swarm initialization
docker swarm init
docker swarm join --token <token> <manager-ip>:2377

# Swarm services
docker service create --name myservice <image>
docker service ls
docker service ps <service>
docker service scale myservice=5
docker service update --image newimage:tag myservice
```

## Useful Aliases and Shortcuts

### Common Aliases for Shell

```bash
# Add to your .bashrc or .zshrc
alias dps='docker ps'
alias dpsa='docker ps -a'
alias dimg='docker images'
alias drm='docker rm'
alias drmi='docker rmi'
alias dstop='docker stop'
alias dstart='docker start'
alias drestart='docker restart'
alias dlogs='docker logs -f'
alias dexec='docker exec -it'
alias dcompose='docker-compose'
```

### Quick Commands

```bash
# Clean up everything
docker system prune -a -f

# Stop all running containers
docker stop $(docker ps -q)

# Remove all containers
docker rm -f $(docker ps -aq)

# Remove all images
docker rmi -f $(docker images -aq)

# Show disk usage
docker system df
```

## Dangerous Docker Commands

??? danger "Dangerous Docker Commands:"

    Here are the commands from the cheat sheet that can be **dangerous** or **destructive** if used improperly:

    ??? example "EXTREMELY DANGEROUS"

        Can cause data loss or system issues

        ### **System Prune Commands**

        ```bash
        docker system prune -a                 # Removes ALL unused images, containers, networks, and build cache
        docker system prune --volumes          # Removes ALL unused volumes (including important data)
        docker volume prune                    # Removes all unused volumes (data loss risk)
        docker container prune                 # Removes ALL stopped containers
        docker image prune -a                  # Removes ALL images not used by containers
        ```

        ### **Force Removal Commands**

        ```bash
        docker rm -f <container>               # Force remove running container (no graceful shutdown)
        docker rmi -f <image>                  # Force remove image even if used by containers
        ```

        ### **Bulk Removal Commands**

        ```bash
        docker rm -f $(docker ps -aq)          # Stops and removes ALL containers
        docker rmi -f $(docker images -aq)     # Removes ALL images
        docker volume rm $(docker volume ls -q) # Removes ALL volumes
        ```

    ??? example "MODERATELY DANGEROUS"

        ### **Data Loss Risks**

        ```bash
        docker-compose down -v                 # Removes containers AND volumes (data loss)
        docker run --rm                        # Auto-removes container after exit (lose container state)
        docker export                          # Exports container without metadata (not a backup solution)
        ```

        ### **Security Risks**

        ```bash
        docker run --privileged                # Gives container full host privileges
        docker run --cap-add ALL               # Adds all Linux capabilities (security risk)
        docker run --user root                 # Runs as root inside container (unless necessary)
        ```

        ### **Resource Risks**

        ```bash
        docker run --memory=0                  # Unlimited memory (can crash host)
        docker update --memory 0 <container>   # Sets unlimited memory
        ```

??? QUESTION "Why These Are Dangerous"


    ### **Data Loss Scenarios:**

    ```bash
    # 🚨 WILL DELETE ALL YOUR VOLUMES AND DATA
    docker system prune --volumes

    # 🚨 WILL DELETE ALL CONTAINERS (running and stopped)
    docker rm -f $(docker ps -aq)

    # 🚨 WILL DELETE DATABASE VOLUMES PERMANENTLY
    docker volume prune
    ```

    ### **Production Outage Risks:**

    ```bash
    # 🚨 REMOVES RUNNING CONTAINERS WITHOUT GRACEFUL SHUTDOWN
    docker rm -f production-db-container

    # 🚨 REMOVES IMAGES USED BY RUNNING CONTAINERS
    docker rmi -f $(docker images -aq)
    ```

??? success "Safer Alternatives"

    ### **Instead of dangerous prune commands:**

    ```bash
    # Safe: See what would be removed first
    docker system prune --dry-run
    docker volume prune --dry-run

    # Safe: Interactive removal
    docker system prune                    # Asks for confirmation (usually safe)
    ```

    ### **Instead of force removal:**

    ```bash
    # Safe: Stop gracefully first, then remove
    docker stop <container> && docker rm <container>

    # Safe: Check what's using an image before removal
    docker image inspect <image> | grep -A 10 "Container"
    ```

    ### **Instead of bulk commands:**

    ```bash
    # Safe: Remove specific containers/images
    docker rm container1 container2
    docker rmi old-image:tag unused-image:tag

    # Safe: Use filters for selective removal
    docker container prune --filter "until=24h"
    ```

    ??? tip "Best Practices to Avoid Disasters"

        **Always use `--dry-run` first:**

        ```bash
        docker system prune --dry-run
        docker volume prune --dry-run
        ```

        **Use filters for selective cleanup:**

        ```bash
        docker container prune --filter "until=24h"
        docker image prune --filter "until=48h"
        ```

        **Backup volumes before removal:**

        ```bash
        # Backup before cleaning
        docker run --rm -v myvolume:/data -v $(pwd):/backup alpine \
        tar czf /backup/backup.tar.gz -C /data ./
        ```

        **Use descriptive names and tags:**

        ```bash
        # Good: Easy to identify what to remove
        docker rmi myapp:old-test-version
        # Bad: Hard to identify
        docker rmi $(docker images -q)
        ```

        **Never run these in production without testing in staging first!**