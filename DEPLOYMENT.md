# Deployment Guide

This guide covers deploying TherapAI to various serverless platforms.

## Vercel Deployment (Recommended)

### Prerequisites
- Vercel account
- GitHub repository connected to Vercel

### Steps

1. **Install Vercel CLI** (optional)
```bash
npm i -g vercel
```

2. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**

In Vercel Dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

4. **Deploy**
```bash
vercel --prod
```

Or push to main branch for automatic deployment.

### Vercel Configuration

The `next.config.ts` is already configured for Vercel serverless functions.

## AWS Lambda Deployment

### Prerequisites
- AWS account
- AWS CLI configured
- Terraform or Serverless Framework (optional)

### Using AWS Amplify

1. **Build the app**
```bash
npm run build
```

2. **Create Amplify App**
   - Go to AWS Amplify Console
   - Connect your GitHub repository
   - Configure build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

3. **Add Environment Variables** in Amplify Console

### Using AWS CDK (Advanced)

```typescript
// Example CDK stack for Lambda deployment
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class TherapAIStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string) {
    super(scope, id);
    
    new lambda.Function(this, 'NextJsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('.next'),
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        // ... other env vars
      },
    });
  }
}
```

## Netlify Deployment

1. **Install Netlify Plugin**
```bash
npm install -D @netlify/plugin-nextjs
```

2. **Create `netlify.toml`**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

3. **Deploy**
```bash
netlify deploy --prod
```

## Docker Deployment (Alternative to Serverless)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t therapai .
docker run -p 3000:3000 therapai
```

## FastAPI Backend (Optional Separate Deployment)

If you want to deploy FastAPI separately:

### Create `api/main.py`
```python
from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "TherapAI API"}

# AWS Lambda handler
handler = Mangum(app)
```

### Deploy to AWS Lambda
```bash
pip install -r requirements.txt -t .
zip -r lambda.zip .
aws lambda create-function \
  --function-name therapai-api \
  --runtime python3.11 \
  --handler main.handler \
  --zip-file fileb://lambda.zip
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `OPENAI_API_KEY` | OpenAI API key for LangChain | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | Yes |

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test authentication flow
- [ ] Test patient portal chat
- [ ] Test doctor dashboard
- [ ] Test SOAP note generation
- [ ] Check API endpoint responses
- [ ] Verify database connections
- [ ] Enable HTTPS
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy
- [ ] Review security settings

## Monitoring & Logging

### Vercel
- Built-in analytics available in dashboard
- Real-time function logs
- Performance monitoring

### AWS
- CloudWatch for Lambda logs
- X-Ray for tracing
- CloudWatch Insights for queries

### Supabase
- Database logs available in dashboard
- API usage statistics
- Row-level security audit logs

## Troubleshooting

### Common Issues

**API Routes Returning 500**
- Check environment variables are set correctly
- Verify OpenAI API key is valid
- Check Supabase connection

**Authentication Not Working**
- Verify Supabase URL and keys
- Check redirect URLs in Supabase dashboard
- Ensure middleware.ts is deployed

**Database Queries Failing**
- Verify RLS policies are set up
- Check user has correct role
- Verify table permissions

## Scaling Considerations

### Serverless Limits
- Vercel: 10s execution limit (hobby), 60s (pro)
- AWS Lambda: 15 minutes max execution
- Consider cold starts for infrequent routes

### Database Scaling
- Supabase free tier: 500MB, upgrade for more
- Connection pooling enabled by default
- Consider read replicas for heavy loads

### Cost Optimization
- Use edge functions for static content
- Implement request caching
- Optimize API calls to OpenAI
- Monitor and set up usage alerts

## Support

For deployment issues:
- Check [Next.js deployment docs](https://nextjs.org/docs/deployment)
- Supabase [deployment guide](https://supabase.com/docs/guides/getting-started)
- [GitHub Issues](https://github.com/AidanSYu/TherapAI/issues)
