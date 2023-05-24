// Copyright 2016-2020, Pulumi Corporation.  All rights reserved.

import * as docker from "@pulumi/docker";
import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

// Location to deploy Cloud Run services
const location = gcp.config.region || "us-central1";

// -------------------------------------- //
// Deploy a custom container to Cloud Run //
// -------------------------------------- //

// Build a Docker image from our sample Ruby app and put it to Google Container Registry.
// Note: Run `gcloud auth configure-docker` in your command line to configure auth to GCR.
const imageName = "python-app";
const myImage = new docker.Image(imageName, {
    imageName: pulumi.interpolate`gcr.io/${gcp.config.project}/${imageName}:v1.0.0`,
    build: {
        context: "../",
    },
});

// Deploy to Cloud Run. Some extra parameters like concurrency and memory are set for illustration purpose.
const angularService = new gcp.cloudrun.Service("python", {
    location,
    template: {
        spec: {
            containers: [{
                image: myImage.imageName,
                ports: [{
                    containerPort: 5000
                }],
                resources: {
                    limits: {
                        memory: "1Gi",
                    },
                },
            }],
            containerConcurrency: 50,
        },
    },
});

// Open the service to public unrestricted access
const iamAngular = new gcp.cloudrun.IamMember("python-everyone", {
    service: angularService.name,
    location,
    role: "roles/run.invoker",
    member: "allUsers",
});

// Export the URL
export const angularUrl = angularService.statuses[0].url;
