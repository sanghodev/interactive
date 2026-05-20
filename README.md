# Interactive Archives

A collection of interactive, generative, and physics-based web experiments built with Next.js, React, and Canvas.

## 📌 배포 및 호스팅 정보 (Hosting & Deployment)

나중에 헷갈리지 않기 위해 기록해 두는 커스텀 노트입니다.

- **버전 관리 (Git):** 이 프로젝트의 소스 코드는 Git을 통해 관리되며 GitHub 저장소에 푸시됩니다.
- **호스팅 (Hosting):** 이 프로젝트는 **Cloudflare Pages**를 통해 호스팅되고 있습니다.
  - **대시보드 접속:** [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
  - **로그인 계정:** `donutscan@gmail.com`
- **배포 방식 (CI/CD):** 
  - GitHub 저장소에 코드를 `push` (커밋 후 업로드) 하면, Cloudflare Pages가 이를 감지하고 자동으로 빌드하여 라이브 서버에 반영합니다.
  - 즉, 코드를 수정하고 **Git으로 푸시만 하면 자동으로 업데이트**됩니다!
- **도메인 연결 (Domain):** 커스텀 도메인 역시 Cloudflare Pages에 직접 연결되어 있어, 배포가 완료되면 해당 도메인으로 바로 접속하여 확인할 수 있습니다.

---

## Getting Started (로컬 개발)

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
