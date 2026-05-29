FROM public.ecr.aws/lambda/nodejs:22 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npx tsc

FROM public.ecr.aws/lambda/nodejs:22
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./
CMD ["app.handler"]
