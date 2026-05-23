# Mini Paint Studio Implementation Plan

> **For agentic workers:** If running inside Superpowers, use `subagent-driven-development` or `executing-plans` skill. If running standalone (no Superpowers), implement tasks directly in this session — TDD steps and code are self-contained; skip skill invocations but follow the same red-green-refactor flow.

**Goal:** Build a web tool for miniature painting hobbyists to manage paint libraries, compute color mixing recipes, preview colors on 3D models, and save mixing/lighting presets.

**Architecture:** React SPA (Vite + TypeScript + @react-three/fiber) + Spring Boot REST API (Java 17 + JPA + PostgreSQL) + local FS for files.

**Tech Stack:** React 18, Vite 5, TypeScript, @react-three/fiber, drei, three-stdlib, Zustand / Spring Boot 3, Spring Security + JWT, JPA, PostgreSQL 16, Docker Compose

## Commit Message Convention

每步 commit 格式：

```
<type>: <简短描述>

Subagent: <agent-name>-<session-id>
Human-Edit: <修改内容>（如适用）
```

- `<type>`: feat / fix / chore / docs / test / refactor
- `<agent-name>`: 执行该 task 的智能体名称（如 `claude-code`、`codex`、`cursor`）
- `<session-id>`: 该次会话的自增编号（如 `s1`、`s2`）
- `Human-Edit` 行：仅当人工修改了 subagent 产出的代码时才加

**PLAN 追踪规则**：每完成一个 task 后，将此 task 标题的 `- [ ]` 改为 `- [x]`，并在标题后追加 commit hash。示例：
```
- [x] **Task 1.1: JWT Token Provider** — `a1b2c3d`
```

---

## File Map

```
backend/
├── pom.xml
├── src/main/java/com/minipaint/
│   ├── MiniPaintApplication.java
│   ├── config/{SecurityConfig,CorsConfig,FileStorageConfig}.java
│   ├── model/
│   │   ├── entity/{User,Paint,Recipe,StlFile,LightingPreset}.java
│   │   ├── dto/request/{RegisterRequest,LoginRequest,ForgotPasswordRequest,ResetPasswordRequest,PaintCreateRequest,PaintUpdateRequest,MixRequest,StlRenameRequest,RecipeSaveRequest,RecipeUpdateRequest,LightingPresetRequest}.java
│   │   └── dto/response/{AuthResponse,ErrorResponse,PaintResponse,MixResponse,MixCandidate,PaintPart,StlResponse,RecipeResponse,RecipeDetailResponse,LightingPresetResponse}.java
│   ├── enums/Brand.java
│   ├── repository/{UserRepository,PaintRepository,RecipeRepository,StlFileRepository,LightingPresetRepository}.java
│   ├── service/{UserService,PaintService,MixService,RecipeService,StlService,LightingPresetService,FileStorageService}.java
│   ├── service/impl/{UserServiceImpl,PaintServiceImpl,MixServiceRgbImpl,RecipeServiceImpl,StlServiceImpl,LightingPresetServiceImpl,FileStorageServiceImpl}.java
│   ├── controller/{AuthController,PaintController,MixController,StlController,RecipeController,LightingPresetController,ColorWheelController}.java
│   └── security/{JwtTokenProvider,JwtAuthenticationFilter}.java
├── src/main/resources/{application.yml,application-dev.yml}
└── src/test/java/com/minipaint/
    ├── MiniPaintApplicationTests.java
    ├── security/JwtTokenProviderTest.java
    ├── repository/UserRepositoryTest.java
    ├── model/dto/RegisterRequestValidationTest.java
    ├── service/{UserServiceTest,PaintServiceTest,MixServiceTest,RecipeServiceTest,StlServiceTest}.java
    └── controller/{AuthControllerTest,PaintControllerTest,MixControllerTest}.java

frontend/
├── package.json, vite.config.ts, tsconfig.json, index.html
└── src/
    ├── main.tsx, App.tsx, index.css
    ├── types/{paint,mix,recipe,stl,lighting}.ts
    ├── services/{api,auth,paint,mix,stl,recipe,lightingPreset,colorWheel}Service.ts
    ├── store/{authStore,colorStore}.ts
    ├── components/{Sidebar,ColorPicker,ColorWheelPanel,ProtectedRoute,EmptyState}.tsx
    └── pages/
        ├── Auth/AuthPage.tsx
        ├── PaintLibrary/{PaintListPage,PaintCard,AddPaintDialog}.tsx
        ├── MixEngine/{MixPage,TargetColorInput,CandidateList}.tsx
        ├── Preview3D/{PreviewPage,Scene,GeometrySelector,MaterialPanel,LightSystem,LightDragHandler,StlUploader,StlTransformPanel,ScreenshotButton}.tsx
        ├── LightingPresets/{PresetListPage,PresetCard}.tsx
        ├── Recipes/{RecipeListPage,RecipeCard,RecipeDetailPage}.tsx
        └── ColorWheel/ColorWheelPage.tsx
```

---

## Dependency Graph

```
Phase 0: Scaffolding → Phase 1: Auth → Phase 2: Paints → Phase 3: Mix → Phase 6: Recipes
                                            ↘ Phase 4: 3D Core → Phase 5: STL → Phase 7: Presets
                                                                        ↘ Phase 8: Integration → Phase 9: Docker/CI
```

---

## Phase 0: Scaffolding

### Task 0.1: Backend Project Initialization

- [ ] **Step 1: Write Spring context load test**

```java
// backend/src/test/java/com/minipaint/MiniPaintApplicationTests.java
package com.minipaint;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
@SpringBootTest
class MiniPaintApplicationTests { @Test void contextLoads() {} }
```

- [ ] **Step 2: Create pom.xml** — Spring Boot 3.2.5 parent, dependencies: web, data-jpa, security, validation, mail, postgresql, jjwt 0.12.5, h2 (test), spring-boot-starter-test, spring-security-test. Java 17.

Run: `cd backend && ./mvnw test -Dtest=MiniPaintApplicationTests` → expected: PASS

- [ ] **Step 3: Create application.yml** — server.port=8080, postgres datasource, jpa.hibernate.ddl-auto=validate, multipart max 20MB, jwt.secret/expiration-ms=86400000, file-storage.upload-dir=./uploads, stl-dir=./stl-files

- [ ] **Step 4: Create application-dev.yml** — h2:mem datasource, ddl-auto=create-drop, file-storage under ./target/

- [ ] **Step 5: Create CorsConfig.java**

```java
package com.minipaint.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET","POST","PUT","DELETE","PATCH","OPTIONS")
                .allowedHeaders("*");
    }
}
```

- [ ] **Step 6: Create MiniPaintApplication.java** — standard @SpringBootApplication main class

Run: `cd backend && ./mvnw test` → PASS

```bash
git add backend/ && git commit -m "chore: scaffold Spring Boot backend with CORS, H2 test profile

Subagent: <name>-s<N>"
```

### Task 0.2: Frontend Project Initialization

- [ ] **Step 1: Write App render test**

```tsx
// frontend/src/App.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
describe('App', () => {
  it('renders title', () => {
    render(<App />);
    expect(screen.getByText('涂装工作站')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Create package.json** — react 18, react-router-dom 6, @react-three/fiber, drei, three, three-stdlib, zustand, axios. Dev: vitest, @testing-library/react, jsdom, vite, typescript, @vitejs/plugin-react

- [ ] **Step 3: Create vite.config.ts** — proxy /api, /uploads, /stl-files to localhost:8080

- [ ] **Step 4: Create tsconfig.json** — strict, jsx react-jsx, target ES2020

- [ ] **Step 5: Create index.html** — lang="zh-CN", title="涂装工作站"

- [ ] **Step 6: Create src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
```

- [ ] **Step 7: Create src/App.tsx**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>涂装工作站</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
```

- [ ] **Step 8: Create src/index.css** — Discord design system CSS variables: --bg-primary #36393f, --bg-secondary #2f3136, --bg-tertiary #202225, --bg-input #40444b, --text-primary #dcddde, --text-secondary #b9bbbe, --text-muted #72767d, --accent #5865f2, --accent-hover #4752c4, --danger #ed4245, --success #57f287, --warning #fee75c, --border #4f545c, --radius-sm 4px, --radius-md 8px, --radius-lg 12px

- [ ] **Step 9: Create type definitions** — `src/types/paint.ts` (Brand, Paint, PaintCreateRequest), `src/types/mix.ts` (MixRequest, MixResponse, MixCandidate, PaintPart), `src/types/recipe.ts` (Recipe), `src/types/stl.ts` (StlFile), `src/types/lighting.ts` (LightingPreset, LightSnapshot, MaterialSnapshot). Follow shape exactly as defined in SPEC §4.5

Run: `cd frontend && npm install && npm test` → PASS

```bash
git add frontend/ && git commit -m "chore: scaffold React+Vite+TS frontend with Discord theme and types

Subagent: <name>-s<N>"
```

---

## Phase 1: User Accounts

### Task 1.1: JWT Token Provider

- [ ] **Step 1: Write test** — `JwtTokenProviderTest.java` with 5 test cases: generate+extract email, validate valid token, reject expired token (sleep 2ms), reject wrong secret, reject malformed token

- [ ] **Step 2: Run red** → COMPILE ERROR

- [ ] **Step 3: Implement JwtTokenProvider** — constructor(@Value jwt.secret, @Value jwt.expiration-ms), generateToken(String email), extractEmail(String token), validateToken(String token), private parse(String token) using jjwt parser

```java
@Component
public class JwtTokenProvider {
    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email) {
        Date now = new Date();
        return Jwts.builder().subject(email).issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs)).signWith(key).compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean validateToken(String token) {
        try { Jwts.parser().verifyWith(key).build().parseSignedClaims(token); return true; }
        catch (JwtException | IllegalArgumentException e) { return false; }
    }
}
```

- [ ] **Step 4: Run test** → 5 tests PASS

Commit: `feat: add JWT token provider with tests`（使用上述格式，标注 Subagent）

### Task 1.2: User Entity + Repository

- [ ] **Step 1: Write UserRepositoryTest** — @DataJpaTest, test findByEmail (found + not found), existsByEmail, auto-generate UUID id and createdAt timestamp

- [ ] **Step 2: Run red** → COMPILE ERROR

- [ ] **Step 3: Create User entity** — @Entity @Table("users"), fields: id UUID PK auto-gen, email VARCHAR unique, passwordHash VARCHAR, createdAt Instant with @PrePersist, no setters

- [ ] **Step 4: Create UserRepository** — extends JpaRepository<User, UUID>, findByEmail(Optional<User>), existsByEmail(boolean)

- [ ] **Step 5: Run test** → 4 tests PASS

Commit: `feat: add User entity and repository`（使用上述格式，标注 Subagent）

### Task 1.3: Auth DTOs

- [ ] **Step 1: Write RegisterRequestValidationTest** — @NotBlank email, @Email format, @Size(min=8) password, test valid req, blank email, invalid email, short password (7 chars), min length (8 chars) accepted

- [ ] **Step 2-3: Create all DTOs in one commit** — RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest, AuthResponse(token+email), ErrorResponse(status+message+fieldErrors map)

`git commit -m "feat: add auth DTOs with Jakarta validation（使用上述格式，标注 Subagent）"`

### Task 1.4: UserService + AuthController

- [ ] **Step 1: Write UserServiceTest** — mock UserRepository + JwtTokenProvider, BCryptPasswordEncoder. 4 tests: register new → token, register duplicate → RuntimeException("已注册"), login correct → token, login wrong pw → RuntimeException

- [ ] **Step 2: Run red** → COMPILE ERROR

- [ ] **Step 3: Create UserService interface** — register, login, forgotPassword, resetPassword

- [ ] **Step 4: Implement UserServiceImpl** — inject UserRepository, JwtTokenProvider, PasswordEncoder. register: check existsByEmail → save bcrypt-hashed → generateToken. login: findByEmail → matches → token. forgotPassword: findByEmail → print reset token to console (MVP). resetPassword: validate token → update password

- [ ] **Step 5: Run test** → 4 tests PASS

- [ ] **Step 6: Write AuthControllerTest** — @WebMvcTest, mock UserService. Test POST /api/auth/register returns 200 with token, POST /api/auth/register with invalid input returns 400

- [ ] **Step 7: Implement AuthController** — @RestController @RequestMapping("/api/auth"), inject UserService, 4 endpoints: POST /register, /login, /forgot-password, /reset-password. All return ResponseEntity with try/catch for RuntimeExceptions, proper status codes (409 duplicate, 401 bad login, 400 validation)

- [ ] **Step 8: Run all tests** → both service + controller pass

Commit: `feat: add UserService and AuthController with register/login/forgot-password`（使用上述格式，标注 Subagent）

### Task 1.5: JWT Filter + Security Config

- [ ] **Step 1: Write JwtAuthenticationFilterTest** — test: valid Bearer token sets SecurityContext, calls filterChain; invalid token returns 401

- [ ] **Step 2: Implement JwtAuthenticationFilter** — extends OncePerRequestFilter, extract "Bearer " token, validate, find user by email, set UsernamePasswordAuthenticationToken in SecurityContext

- [ ] **Step 3: Implement SecurityConfig** — @Configuration @EnableWebSecurity, inject JwtAuthenticationFilter. Stateless session, CSRF disabled, permit /api/auth/**, authenticate /api/**. Add filter before UsernamePasswordAuthenticationFilter. @Bean PasswordEncoder → BCryptPasswordEncoder

- [ ] **Step 4: Run test** → PASS

Commit: `feat: add JWT auth filter and Spring Security config`（使用上述格式，标注 Subagent）

### Task 1.6: Frontend Auth Store, API Service, Auth Page

- [ ] **Step 1: Create src/services/api.ts** — axios instance with baseURL="", interceptors: request attaches Authorization: Bearer token from authStore, response on 401 calls logout() and redirects to /auth

```typescript
import axios from 'axios';
const api = axios.create({ baseURL: '' });
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/auth';
    }
    return Promise.reject(err);
  }
);
export default api;
```

- [ ] **Step 2: Create src/store/authStore.ts**

```typescript
import { create } from 'zustand';
interface AuthState {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (token: string, email: string) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  email: localStorage.getItem('email'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: (token, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    set({ token, email, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    set({ token: null, email: null, isAuthenticated: false });
  },
}));
```

- [ ] **Step 3: Create src/services/authService.ts** — register(email,password), login(email,password), forgotPassword(email)

- [ ] **Step 4: Create AuthPage.tsx** — 3 tabs (登录/注册/忘记密码), login tab: email input + password input + submit button, register tab: email + password + confirm password + submit, forgot password tab: email + submit. All inputs have Chinese placeholder text. Field-level error display (e.g. "密码长度不足 8 位"). Error messages extracted from API response body

```tsx
// Key structure (full implementation in code)
function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [errors, setErrors] = useState<Record<string, string>>({});
  // ... form state, validation, submit handlers
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>涂装工作站</h2>
        <div className="auth-tabs">
          <button onClick={() => setTab('login')}>登录</button>
          <button onClick={() => setTab('register')}>注册</button>
          <button onClick={() => setTab('forgot')}>忘记密码</button>
        </div>
        {/* Conditional form rendering based on tab */}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create ProtectedRoute.tsx** — check isAuthenticated, redirect to /auth if false

- [ ] **Step 6: Wire into App.tsx** — /auth → AuthPage, all other routes wrapped in ProtectedRoute

Run: `cd frontend && npm test` → PASS

Commit: `feat: add auth store, API interceptor, and AuthPage with form validation`（使用上述格式，标注 Subagent）

---

## Phase 2: Paint Library

### Task 2.1: Brand Enum + Paint Entity + Repository

- [ ] **Step 1: Create Brand.java enum** — GW, AV, AK, GSW, Scale75, ArmyPainter, Other

- [ ] **Step 2: Write PaintRepositoryTest** — @DataJpaTest, test: save+findById, findByUserId, unique constraint on userId+brand+code

- [ ] **Step 3: Run red**

- [ ] **Step 4: Create Paint entity** — id UUID PK, userId UUID FK→users, brand @Enumerated(STRING), code, name, r/g/b int, createdAt, updatedAt. @Table uniqueConstraints userId+brand+code. @PrePersist/@PreUpdate for timestamps

- [ ] **Step 5: Create PaintRepository** — extends JPA<Paint, UUID>, findByUserId(UUID userId, Pageable), countByUserId(UUID)

- [ ] **Step 6: Run test** → PASS

Commit: `feat: add Brand enum, Paint entity, and repository`（使用上述格式，标注 Subagent）

### Task 2.2: PaintService + PaintController

- [ ] **Step 1: Write PaintServiceTest** — mock PaintRepository. Tests: create paint, list paints by userId, update paint (name/code/brand), delete paint, delete paint with recipe reference → warning

- [ ] **Step 2: Create PaintService interface + PaintServiceImpl** — CRUD + checkRecipeRefs helper (returns count of referencing recipes)

- [ ] **Step 3: Create PaintCreateRequest, PaintUpdateRequest, PaintResponse DTOs**

- [ ] **Step 4: Write PaintControllerTest** — @WebMvcTest, mock PaintService. Tests: GET /api/paints returns list, POST /api/paints creates, PUT /api/paints/:id updates, DELETE /api/paints/:id deletes, DELETE with recipe refs returns warning

- [ ] **Step 5: Implement PaintController** — @RestController @RequestMapping("/api/paints"). GET / (list with ?brand=&sort=&page=), POST / (create), PUT /{id} (update), DELETE /{id} (check recipe refs first). All authenticated

Commit: `feat: add PaintService CRUD and PaintController REST API`（使用上述格式，标注 Subagent）

### Task 2.3: Frontend Paint Service + List Page

- [ ] **Step 1: Create src/services/paintService.ts** — fetchPaints(params), createPaint(formData image+json), updatePaint(id, data), deletePaint(id)

- [ ] **Step 2: Create PaintListPage.tsx** — filter bar (brand dropdown, sort dropdown: 录入时间/色系), paginated paint card grid, empty state "还没有录入漆料，点击添加第一瓶". Sidebar active

- [ ] **Step 3: Create PaintCard.tsx** — color swatch div (background: rgb(r,g,b)), brand label, code, name, edit/delete buttons

Run: `npm test` → PASS

Commit: `feat: add frontend paint service and PaintListPage`（使用上述格式，标注 Subagent）

### Task 2.4: Add Paint Dialog + ColorPicker Component

- [ ] **Step 1: Create ColorPicker.tsx** — file input (accept jpg/png/webp, max 5MB canvas-resize to 1920px before upload), canvas rendering, click event reads pixel getImageData → extraction RGB, color preview swatch. Reusable prop: onColorPicked(r,g,b). Eye dropper cursor on hover

- [ ] **Step 2: Create AddPaintDialog.tsx** — modal: upload image → ColorPicker → preview selected color + fill brand/code/name form → save. Brand dropdown with all enum values. Form validation: brand required, code required, name required

- [ ] **Step 3: Wire into PaintListPage** — "添加漆料" button opens dialog, on save refresh list

Run: manual verification (upload image, pick color, save paint)

Commit: `feat: add reusable ColorPicker component and AddPaintDialog`（使用上述格式，标注 Subagent）

---

## Phase 3: Mix Engine

### Task 3.1: MixService (Algorithm + Tests)

- [ ] **Step 1: Write MixServiceTest** — critical test cases:

```java
@Test
void shouldFindExactRatio() {
    // 3 paints: red(255,0,0), blue(0,0,255), white(255,255,255)
    // Target: RGB mixture of 2 parts red + 1 part blue = (170, 0, 85)
    // Enumeration should find this exact ratio
    var result = mixService.mix(userId, 170, 0, 85);
    assertThat(result.getCandidates()).isNotEmpty();
    var best = result.getCandidates().get(0);
    assertThat(best.getDeviation()).isLessThan(5.0);
}

@Test
void shouldReturnGrayscaleWhenNoUserPaints() {
    // 0 user paints → black+white fallback
    when(paintRepository.findByUserId(userId)).thenReturn(List.of());
    var result = mixService.mix(userId, 128, 128, 128);
    assertThat(result.getCandidates()).isNotEmpty();
    assertThat(result.getMessage()).contains("录入更多漆料");
}

@Test
void shouldMarkTraceWhenPartsLessThanTenthOfTotal() {
    // Scenario: 3-paint mix, 1:1:18 → the 1-part component should be marked trace
    var result = mixService.mix(userId, ...);
    assertThat(result.getCandidates().get(0).getPaints().stream()
        .anyMatch(p -> p.isTrace() && p.getParts() == 1)).isTrue();
}

@Test
void shouldAlwaysIncludeCmyRef() {
    var result = mixService.mix(userId, 200, 100, 50);
    assertThat(result.getCmyRef()).isNotEmpty(); // CMY + B + W
}

@Test
void performanceUnder50PaintsShouldFinishIn2Seconds() {
    // Generate 50 test paints, measure mix time
    long start = System.currentTimeMillis();
    var result = mixService.mix(userId, 128, 128, 128);
    assertThat(System.currentTimeMillis() - start).isLessThan(2000);
}
```

- [ ] **Step 2: Create MixService interface** — `MixResponse mix(UUID userId, int r, int g, int b)`

- [ ] **Step 3: Implement MixServiceRgbImpl**

```java
@Service
public class MixServiceRgbImpl implements MixService {

    private static final int[] BLACK = {0, 0, 0};
    private static final int[] WHITE = {255, 255, 255};
    private static final int MAX_PAINTS = 3;
    private static final int MAX_TOTAL_PARTS = 6;
    private static final double TRACE_THRESHOLD = 0.1;
    private static final double DEVIATION_WARNING_THRESHOLD = 15.0;
    private static final int TOP_N = 10;

    @Override
    public MixResponse mix(UUID userId, int tr, int tg, int tb) {
        List<Paint> userPaints = paintRepository.findByUserId(userId);
        List<int[]> colors = new ArrayList<>();
        List<Paint> paints = new ArrayList<>();

        // Add built-in black and white
        colors.add(BLACK); paints.add(null); // null = built-in black
        colors.add(WHITE); paints.add(null); // null = built-in white

        // Add user paints
        for (Paint p : userPaints) {
            colors.add(new int[]{p.getR(), p.getG(), p.getB()});
            paints.add(p);
        }

        List<MixCandidate> candidates = enumerate(colors, paints, tr, tg, tb);
        candidates.sort(Comparator.comparingDouble(MixCandidate::getDeviation));
        List<MixCandidate> topN = candidates.stream().limit(TOP_N).collect(Collectors.toList());

        // Generate CMY reference
        List<PaintPart> cmyRef = generateCmyRef(tr, tg, tb);

        String message = null;
        if (userPaints.isEmpty()) {
            message = "录入更多漆料可获得更准确的结果";
        } else if (!topN.isEmpty() && topN.get(0).getDeviation() > DEVIATION_WARNING_THRESHOLD) {
            message = "偏差较大，仅供参考";
        }

        return new MixResponse(topN, cmyRef, message);
    }

    private List<MixCandidate> enumerate(List<int[]> colors, List<Paint> paints, int tr, int tg, int tb) {
        List<MixCandidate> results = new ArrayList<>();
        int n = colors.size();
        // 1-paint mixes
        for (int i = 0; i < n; i++) {
            for (int parts = 1; parts <= MAX_TOTAL_PARTS; parts++) {
                results.add(makeCandidate(colors, paints, List.of(i), List.of(parts), tr, tg, tb));
            }
        }
        // 2-paint mixes
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                for (int p1 = 1; p1 < MAX_TOTAL_PARTS; p1++) {
                    for (int p2 = 1; p1 + p2 <= MAX_TOTAL_PARTS; p2++) {
                        results.add(makeCandidate(colors, paints, List.of(i, j), List.of(p1, p2), tr, tg, tb));
                    }
                }
            }
        }
        // 3-paint mixes
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                for (int k = j + 1; k < n; k++) {
                    for (int p1 = 1; p1 <= MAX_TOTAL_PARTS - 2; p1++) {
                        for (int p2 = 1; p1 + p2 < MAX_TOTAL_PARTS; p2++) {
                            for (int p3 = 1; p1 + p2 + p3 <= MAX_TOTAL_PARTS; p3++) {
                                results.add(makeCandidate(colors, paints, List.of(i, j, k), List.of(p1, p2, p3), tr, tg, tb));
                            }
                        }
                    }
                }
            }
        }
        return results;
    }

    private MixCandidate makeCandidate(List<int[]> colors, List<Paint> paints,
            List<Integer> indices, List<Integer> partsList, int tr, int tg, int tb) {
        int total = partsList.stream().mapToInt(Integer::intValue).sum();
        int mr = 0, mg = 0, mb = 0;
        List<PaintPart> parts = new ArrayList<>();
        for (int i = 0; i < indices.size(); i++) {
            int idx = indices.get(i);
            int[] c = colors.get(idx);
            int part = partsList.get(i);
            mr += c[0] * part;
            mg += c[1] * part;
            mb += c[2] * part;
            Paint p = paints.get(idx);
            parts.add(new PaintPart(
                p != null ? p.getId() : null,
                p != null ? p.getBrand().name() : "SYSTEM",
                p != null ? p.getCode() : (c[0] == 0 ? "BLACK" : "WHITE"),
                p != null ? p.getName() : (c[0] == 0 ? "纯黑" : "纯白"),
                part,
                (double) part / total <= TRACE_THRESHOLD
            ));
        }
        mr /= total; mg /= total; mb /= total;
        double deviation = Math.sqrt(Math.pow(mr - tr, 2) + Math.pow(mg - tg, 2) + Math.pow(mb - tb, 2));
        return new MixCandidate(parts, mr, mg, mb, deviation);
    }

    private List<PaintPart> generateCmyRef(int r, int g, int b) {
        // CMY = 1 - RGB normalized; then add black/white for value adjustment
        // Simplified: return theoretical CMY + B + W reference
        // Implementation computes cyan(255-r), magenta(255-g), yellow(255-b), normalized proportionally
        // ...
    }
}
```

- [ ] **Step 4: Run test** → all 5 tests PASS

Commit: `feat: add MixService with RGB exhaustive enumeration, built-in black/white fallback, trace marking`（使用上述格式，标注 Subagent）

### Task 3.2: MixController + DTOs

- [ ] **Step 1: Create MixRequest (r,g,b), MixResponse (candidates, cmyRef, message), MixCandidate (paints list, mixedR/G/B, deviation), PaintPart (paintId, brand, code, name, parts, trace)**

- [ ] **Step 2: Write MixControllerTest** — POST /api/mix {r,g,b} → 200 with candidates, missing r → 400

- [ ] **Step 3: Implement MixController** — @PostMapping("/api/mix"), delegates to mixService.mix(authUser.getId(), request.r, r.g, r.b)

Commit: `feat: add MixController and mix DTOs`（使用上述格式，标注 Subagent）

### Task 3.3: Frontend Mix Page

- [ ] **Step 1: Create src/services/mixService.ts** — postMix(r,g,b): Promise<MixResponse>

- [ ] **Step 2: Create TargetColorInput.tsx** — 3 tabs: "取色器" (opens ColorPicker), "色轮" (opens ColorWheelPanel, or set state for later integration), "手动输入" (3 number inputs or hex input). Selected color preview swatch. "计算混色" button

- [ ] **Step 3: Create CandidateList.tsx** — ranked list, each card: color swatch, paint list with parts ratio (colored dots), hex mixed color preview, deviation number. "少量" badge on trace parts. "预览" button (navigate to /preview?r=&g=&b=), "保存配方" button

- [ ] **Step 4: Create MixPage.tsx** — layout: left TargetColorInput, right CandidateList (hidden until results). Empty target state: "选择目标色开始混色计算"。No paints state: "请先在漆料库录入漆料"

Run: `npm test` → PASS

Commit: `feat: add MixEngine page with target input, candidate display, and integration hooks`（使用上述格式，标注 Subagent）

---

## Phase 4: 3D Preview Core

### Task 4.1: Scene Setup (R3F Canvas + Grid + Geometries)

- [ ] **Step 1: Create Scene.tsx**

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { Suspense } from 'react';

function Model({ geometry, color }: { geometry: 'sphere' | 'cube' | 'cylinder'; color: string }) {
  const geo = geometry === 'sphere' ? <sphereGeometry args={[1, 32, 32]} />
    : geometry === 'cube' ? <boxGeometry args={[1.5, 1.5, 1.5]} />
    : <cylinderGeometry args={[1, 1, 2, 32]} />;
  return (
    <mesh>
      {geo}
      <meshStandardMaterial color={color} roughness={0.5} metalness={0} />
    </mesh>
  );
}

export function Scene({ geometry, color }: { geometry: 'sphere' | 'cube' | 'cylinder'; color: string }) {
  return (
    <Canvas camera={{ position: [3, 2, 5], fov: 50 }} style={{ background: '#808080' }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[2, 3, 2]} intensity={1.0} />
        <directionalLight position={[0, 3, -2]} intensity={0.6} />
        <Model geometry={geometry} color={color} />
        <Grid infiniteGrid fadeDistance={30} />
        <OrbitControls />
      </Suspense>
    </Canvas>
  );
}
```

- [ ] **Step 2: Create GeometrySelector.tsx** — 3 tab buttons: 球体/立方体/圆柱体, active state styling. STL dropdown placeholder (Phase 5)

- [ ] **Step 3: Create PreviewPage.tsx** — layout: left Canvas (~70% width), right control panel (~30%). State: geometry (default 'sphere'), color (default '#808080'), roughness (0.5), metalness (0). URL param support: ?r=&g=&b= and ?preset=&lt;id&gt;

```bash
git commit -m "feat: add 3D scene with R3F Canvas, geometry selector, and default lighting（使用上述格式，标注 Subagent）"
```

### Task 4.2: Material Panel

- [ ] **Step 1: Create MaterialPanel.tsx** — color swatch + button to open ColorPicker, roughness slider (0-1, step 0.01, default 0.5), metalness slider (0-1, step 0.01, default 0). All controls labels in Chinese (粗糙度/金属度). On change → update parent state → Scene re-renders

- [ ] **Step 2: Wire into PreviewPage** — material state passed to Scene as props, values from URL params override defaults

Commit: `feat: add material panel with color picker, roughness, and metalness sliders`（使用上述格式，标注 Subagent）

### Task 4.3: Multi-Light System

- [ ] **Step 1: Create LightDragHandler.ts** — custom hook returning { onPointerDown, onPointerMove, onPointerUp }. Uses Raycaster for hit-testing light markers against mouse position. Projects drag movement onto camera plane. Returns new position {x,y,z} on drag end.

```typescript
export function useLightDrag(
  camera: THREE.Camera,
  glDomElement: HTMLCanvasElement | null,
  lightRefs: React.MutableRefObject<Map<number, THREE.Mesh>>,
  onLightMoved: (index: number, pos: {x: number, y: number, z: number}) => void
) {
  // pointerdown: raycaster intersect with light markers → select light
  // pointermove: project mouse delta to camera plane → update position
  // pointerup: finalize position
}
```

- [ ] **Step 2: Create LightSystem.tsx** — state: lights array (default: 2 directional at [2,3,2] and [0,3,-2], intensity 1.0, color #FFFFFF, colorTemp 5500K). Add/minus buttons (1-6 range). Per-light controls: XYZ sliders, intensity slider (0-10), color temp slider (2000-10000K) + HEX picker, on/off toggle. Light markers rendered as small glow spheres in scene.

- [ ] **Step 3: Wire scroll capture** — when light selected, add `wheel` event listener on Canvas element with `{capture: true}` and `stopPropagation()`. When no light selected, wheel = OrbitControls zoom (default behavior).

- [ ] **Step 4: Add click-on-blank to deselect** — pointerdown on no light marker → clear selection

Run manual verification: open /preview, add light, drag it, adjust sliders, verify bidirectional sync

Commit: `feat: add multi-light system with custom Raycaster drag, XYZ fine-tune, scroll isolation`（使用上述格式，标注 Subagent）

---

## Phase 5: STL Support

### Task 5.1: FileStorageService

- [ ] **Step 1: Create FileStorageService interface** — store(MultipartFile, String subdir): String path, delete(String path): void, toAccessUrl(String path): String

- [ ] **Step 2: Create FileStorageServiceImpl** — inject FileStorageConfig (uploadDir, stlDir). store: generate UUID filename, create directory if not exists, Files.copy. delete: Files.deleteIfExists. toAccessUrl: prefix with /uploads/ or /stl-files/

- [ ] **Step 3: Create FileStorageConfig** — @ConfigurationProperties("file-storage"), uploadDir, stlDir as String

Commit: `feat: add FileStorageService with local filesystem implementation`（使用上述格式，标注 Subagent）

### Task 5.2: StlFile Entity + Service + Controller

- [ ] **Step 1: Create StlFile entity** — id UUID PK, userId FK, originalName, displayName, filePath, rotationX/Y/Z (default 0), heightOffset (default 0), fileSize bigint, createdAt

- [ ] **Step 2: Create StlFileRepository** — findByUserId(UUID)

- [ ] **Step 3: Create StlService** — upload(userId, file), list(userId), updateTransform(id, rotationX/Y/Z, heightOffset, displayName), delete(id)

- [ ] **Step 4: Create StlController** — POST /api/stl/upload (multipart), GET /api/stl, PUT /api/stl/:id, DELETE /api/stl/:id

Commit: `feat: add STL file entity, storage, and REST API`（使用上述格式，标注 Subagent）

### Task 5.3: Frontend STL Upload + Transform

- [ ] **Step 1: Create StlUploader.tsx** — file input (accept .stl, max 20MB), upload progress, on success → auto-add to geometry dropdown and auto-select

- [ ] **Step 2: Create StlTransformPanel.tsx** — rotation X/Y/Z sliders (±180°, default 0), height offset slider (-3 to +3, default 0). Update StlFile record on change

- [ ] **Step 3: Update Scene.tsx** — load STL via STLLoader from three-stdlib, wrap in Suspense + ErrorBoundary. Compute bounding box, auto-center and normalize scale. Apply rotation and heightOffset from props. **useEffect dependency array must include heightOffset**

- [ ] **Step 4: Update GeometrySelector.tsx** — add STL files dropdown section below built-in tab. Click STL → select it and highlight. Click built-in tab → clear STL selection

Run manual: upload a small STL, verify it loads centered, rotate via sliders, click sphere → STL deselects

Commit: `feat: add STL upload, auto-center/normalize, independent transform, and ErrorBoundary`（使用上述格式，标注 Subagent）

---

## Phase 6: Recipe Management

### Task 6.1: Recipe Backend

- [ ] **Step 1: Create Recipe entity** — id UUID PK, userId FK, name, tags TEXT[], targetR/G/B int, mixSnapshots JSONB, cmyRef JSONB, notes TEXT, sourceImagePath, createdAt, updatedAt

- [ ] **Step 2: Create RecipeRepository** — findByUserId, findByUserIdAndTagsContaining, search by name LIKE

- [ ] **Step 3: Create RecipeService** — save(userId, request), list(userId, tag, search), detail(userId, id), update(userId, id, request), delete(userId, id)

- [ ] **Step 4: Create RecipeController** — GET /api/recipes, GET /api/recipes/:id, PUT /api/recipes/:id, DELETE /api/recipes/:id

- [ ] **Step 5: Create RecipeSaveRequest** (name, tags, notes, mixSnapshots/JSON, cmyRef/JSON), RecipeUpdateRequest (name, tags, notes), RecipeResponse, RecipeDetailResponse. RecipeDetailResponse includes paint reference status (active or deleted marker)

Commit: `feat: add Recipe entity, service, and REST API with JSONB snapshot storage`（使用上述格式，标注 Subagent）

### Task 6.2: Frontend Recipe Pages

- [ ] **Step 1: Create recipeService.ts** — fetchRecipes, saveRecipe, updateRecipe, deleteRecipe

- [ ] **Step 2: Create RecipeCard.tsx** — name, tags chips, target color swatch, date

- [ ] **Step 3: Create RecipeListPage.tsx** — tag filter (extracted from all recipes' tags), search input, recipe card grid. Empty state: "还没有保存配方，去混色引擎试试"

- [ ] **Step 4: Create RecipeDetailPage.tsx** — target color swatch, mix candidates list with color comparison bars, CMY reference, notes, tags. "在3D中预览" button. Deleted paint markers

Commit: `feat: add Recipe list, detail pages with tag filter and search`（使用上述格式，标注 Subagent）

---

## Phase 7: Lighting Presets

### Task 7.1: LightingPreset Backend

- [ ] **Step 1: Create LightingPreset entity** — id UUID PK, userId FK, name, geometryType (sphere/cube/cylinder/stl), geometryRefId (nullable FK→stl_files), materialSnapshot JSONB {r,g,b,roughness,metalness}, lightsSnapshot JSONB [{type,pos{x,y,z},hex,colorTemp,intensity,enabled}], coverImagePath, createdAt, updatedAt

- [ ] **Step 2: Create LightingPresetService + Controller** — CRUD with cover image handling (accept base64 PNG from frontend screenshot, convert to file)

- [ ] **Step 3: API** — POST /api/lighting-presets, GET /api/lighting-presets, PUT /api/lighting-presets/:id, DELETE /api/lighting-presets/:id

Commit: `feat: add lighting preset CRUD with cover image support`（使用上述格式，标注 Subagent）

### Task 7.2: Frontend Preset Pages + Screenshot

- [ ] **Step 1: Create ScreenshotButton.tsx** — onClick: `renderer.domElement.toDataURL('image/png')` (requires preserveDrawingBuffer:true on WebGLRenderer), pass to parent callback

- [ ] **Step 2: Create PresetCard.tsx** — cover thumbnail, name, geometry type label, date, "应用"/"删除" buttons

- [ ] **Step 3: Create PresetListPage.tsx** — search, preset card grid. Empty state guidance

- [ ] **Step 4: Wire into PreviewPage** — "保存方案" button triggers screenshot → save preset. Dropdown quick-load in PreviewPage. Apply button on PresetListPage navigates to /preview?preset=id

Commit: `feat: add lighting preset pages with auto-screenshot cover and apply-navigate flow`（使用上述格式，标注 Subagent）

---

## Phase 8: Color Wheel + Cross-Page Integration

### Task 8.1: ColorWheelController (Backend)

- [ ] **Step 1: Create ColorWheelController** — GET /api/color-wheel/complementary?r=&g=&b=, /triadic, /analogous, /split-complementary. Each calculates HSL → rotate hue → return list of {r,g,b,label}. Stateless, no auth required (utility endpoint)

Commit: `feat: add ColorWheelController with complementary/triadic/analogous calculation`（使用上述格式，标注 Subagent）

### Task 8.2: ColorWheel Page + Panel (Frontend)

- [ ] **Step 1: Create ColorWheelPage.tsx** — full-page HSL color wheel rendered on Canvas. Click to select hue + saturation. Below: selected color swatch + 4 scheme panels (complementary, triadic, analogous, split-complementary). Each scheme card shows color swatches + labels

- [ ] **Step 2: Create ColorWheelPanel.tsx** — floating panel version (smaller, modal/drawer). Same logic, used from PaintLibrary/MixEngine/Preview3D

- [ ] Step 3: Create colorWheelService.ts → thin wrapper around ColorWheelController API

- [ ] **Step 4: Create colorStore.ts** — Zustand store: selectedColor {r,g,b} | null, sourcePage string, setSelectedColor(r,g,b,source) → consumed by calling page

Commit: `feat: add ColorWheel full page and floating panel with scheme calculations`（使用上述格式，标注 Subagent）

### Task 8.3: Cross-Page Integration

- [ ] **Step 1: Wire Sidebar** — active route state, all 6 pages (except /auth) visible in sidebar

- [ ] **Step 2: Wire MixEngine → 3D Preview** — "预览" button navigates to `/preview?r=170&g=85&b=0`

- [ ] **Step 3: Wire MixEngine → Recipes** — "保存配方" opens modal, saves, navigates to /recipes

- [ ] **Step 4: Wire Preview3D → Screenshot → MixEngine** — screenshot triggers ColorPicker, after pick → navigate to /mix with color state

- [ ] **Step 5: Wire ColorWheel to each page** — PaintLibrary: show existing paint hues on wheel. MixEngine: selected color fills target. Preview3D: selected color applies to material

- [ ] **Step 6: Wire Preview3D → LightingPresets** — "保存方案" button with auto-screenshot

Run: manual end-to-end flow validation — upload paint → pick target → mix → preview → save recipe → save lighting preset → recall

Commit: `feat: wire cross-page navigation, ColorWheel integration, and complete user flows`（使用上述格式，标注 Subagent）

---

## Phase 9: Containerization + CI

### Task 9.1: Backend Dockerfile

```
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src/ src/
RUN mvn package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /app/uploads /app/stl-files
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Task 9.2: Frontend Dockerfile + Nginx Config

```
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

nginx.conf:
```
server {
    listen 80;
    location / { root /usr/share/nginx/html; try_files $uri /index.html; }
    location /api/ { proxy_pass http://backend:8080; }
    location /uploads/ { proxy_pass http://backend:8080; }
    location /stl-files/ { proxy_pass http://backend:8080; }
}
```

### Task 9.3: Docker Compose

```yaml
services:
  db:
    image: postgres:16-alpine
    environment: {POSTGRES_USER: minipaint, POSTGRES_PASSWORD: minipaint, POSTGRES_DB: minipaint}
    volumes: [pgdata:/var/lib/postgresql/data]
  backend:
    build: ./backend
    depends_on: [db]
    environment: {DB_USERNAME: minipaint, DB_PASSWORD: minipaint}
    volumes: [uploads:/app/uploads, stl_files:/app/stl-files]
  frontend:
    build: ./frontend
    depends_on: [backend]
    ports: ["80:80"]
volumes: {pgdata:, uploads:, stl_files:}
```

### Task 9.4: GitHub Actions CI

```yaml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps: [{uses: actions/checkout@v4}, {uses: actions/setup-java@v4, with: {java-version: 17, distribution: temurin}},
            {run: cd backend && ./mvnw test}]
  frontend:
    runs-on: ubuntu-latest
    steps: [{uses: actions/checkout@v4}, {uses: actions/setup-node@v4, with: {node-version: 20}},
            {run: cd frontend && npm ci && npm test}]
  docker:
    needs: [backend, frontend]
    runs-on: ubuntu-latest
    steps: [{uses: actions/checkout@v4},
            {run: docker compose build}]
```

### Task 9.5: README.md

Standard sections: project introduction, tech stack, quick start (docker compose up), dev setup (backend + frontend separately), directory structure, environment variables, API overview, license.

Commit: `docs: add README with setup instructions`（使用上述格式，标注 Subagent）

---

## Spec Coverage Verification

| SPEC Requirement | Task(s) |
|---|---|
| US1 Paint library entry | 2.3, 2.4 |
| US2 Mix engine calculation | 3.1, 3.2, 3.3 |
| US3 3D material preview | 4.1, 4.2 |
| US4 STL upload + transform | 5.1, 5.2, 5.3 |
| US5 Save recipes + presets | 6.1, 6.2, 7.1, 7.2 |
| US6 Color wheel | 8.1, 8.2 |
| US7 Screenshot color pick | 7.2, 8.3 |
| 2.1 Paint Library | Phase 2 |
| 2.2 Mix Engine | Phase 3 |
| 2.3 3D Preview (6 sub-parts) | Phase 4 + 5 + 7.2 |
| 2.4 Color Wheel | Phase 8 |
| 2.5 Recipe Management | Phase 6 |
| 2.6 User Accounts | Phase 1 |
| 3. Page Structure | Task 8.3 (Sidebar wiring) |
| 4. Architecture | Phase 0 scaffolding |
| 5. Containerization | Phase 9 |
| 6. Non-functional | Throughout (ErrorBoundary 5.3, form validation 1.6, TDD all tasks) |
| 7. Acceptance Criteria | Each task includes verification steps |
| 8. Risks | Light drag implementation 4.3, STL useEffect 5.3, ΔE threshold 3.1 |
