#!/bin/sh
set -e

SSM_PARAMS=(
  "crdb/endpoint:tidb"
  "crdb/port:4000"
  "crdb/database:noos_dev"
  "crdb/username:crdb"
  "crdb/password:docker"
  "redis/host:redis-node-0"
  "redis/port:6379"
)

S3_BUCKETS=(
  "local-bucket"
)

SQS_QUEUES=("queue" "fifo-queue.fifo")

for param in "${SSM_PARAMS[@]}"; do
  key="${param%%:*}"
  value="${param##*:}"
  aws ssm put-parameter --name "$SSM_PREFIX/$key" --value "$value" --type "String"
done

for bucket in "${S3_BUCKETS[@]}"; do
  aws s3api create-bucket --bucket "$bucket" --region "$AWS_REGION" \
    --create-bucket-configuration LocationConstraint="$AWS_REGION"
done

for queue in "${SQS_QUEUES[@]}"; do
  if [[ "$queue" == *.fifo ]]; then
    aws sqs create-queue --queue-name "$queue" --attributes FifoQueue=true,ContentBasedDeduplication=true
  else
    aws sqs create-queue --queue-name "$queue"
  fi
done
