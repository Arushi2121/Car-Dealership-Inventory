# Test report

Both suites were run on Sunday, 25 October 2026. The counts and tables below are copied from the command output. Vitest's text report lists only files below 100% coverage; files it leaves out are fully covered.

## Backend

The backend integration tests run through real HTTP (Supertest) against a real PostgreSQL database, in a separate `test` schema that is emptied before each test. Unit tests cover the services with fake repositories.

Command, from `backend/`:

```
npm run test:coverage
```

```
 Test Files  20 passed (20)
      Tests  140 passed (140)
```

```
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   96.89 |    91.95 |   97.77 |    96.7 |                   
 ...dules/vehicles |   95.45 |    85.18 |     100 |   95.08 |                   
  ...repository.ts |   88.88 |       75 |     100 |    87.5 | 38                
  ...repository.ts |   85.71 |       80 |     100 |   83.33 | 47,56             
  ...es.schemas.ts |     100 |    88.88 |     100 |     100 | 33                
 src/shared        |   78.26 |       70 |   84.61 |   78.26 |                   
  config.ts        |   61.53 |       40 |   66.66 |   61.53 | 36-39,47-48       
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 96.89% ( 250/258 )
Branches     : 91.95% ( 80/87 )
Functions    : 97.77% ( 88/90 )
Lines        : 96.7% ( 235/243 )
================================================================================
```

## Frontend

Components are tested with React Testing Library, with the API mocked by MSW at the network level.

Command, from `frontend/`:

```
npm run test:coverage
```

```
 Test Files  17 passed (17)
      Tests  110 passed (110)
```

```
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   86.05 |    79.83 |   83.68 |   88.69 |                   
 app               |   19.23 |    33.33 |   14.28 |   17.39 |                   
  App.tsx          |       0 |        0 |       0 |       0 | 12                
  NotFoundPage.tsx |       0 |      100 |       0 |       0 | 6                 
  ...artBanner.tsx |       0 |        0 |       0 |       0 | 9-18              
  ...guidePage.tsx |       0 |      100 |       0 |       0 | 5-94              
  providers.tsx    |       0 |      100 |       0 |       0 | 7-10              
 app/layouts       |       0 |        0 |       0 |       0 |                   
  AppHeader.tsx    |       0 |        0 |       0 |       0 | 7-9               
  SiteHeader.tsx   |       0 |        0 |       0 |       0 | 6-65              
 features/admin    |   90.12 |    82.14 |   95.08 |   94.11 |                   
  ...cleDialog.tsx |     100 |       50 |     100 |     100 | 19                
  ...ockDialog.tsx |   85.71 |       50 |      75 |    92.3 | 27                
  ...ormDialog.tsx |   89.18 |       90 |   92.85 |    90.9 | 56-57,121         
  vehicleForm.ts   |   81.13 |    73.68 |    87.5 |   90.47 | 56-60             
 features/auth     |   91.37 |       75 |   94.28 |   95.28 |                   
  AuthProvider.tsx |   95.23 |       75 |    90.9 |     100 | 52                
  GuestOnly.tsx    |       0 |        0 |       0 |       0 | 8-12              
  LoginPage.tsx    |     100 |    58.33 |     100 |     100 | 12-38             
  RegisterPage.tsx |   93.75 |       75 |     100 |     100 | 14,16,40-43       
  session.ts       |   90.47 |     87.5 |     100 |   94.73 | 58                
 features/deals    |   81.81 |    78.94 |     100 |   83.33 |                   
  deals.ts         |   76.47 |    69.23 |     100 |   78.57 | 27,32-33          
 features/finance  |   89.47 |      100 |   66.66 |   88.23 |                   
  ...alculator.tsx |   81.81 |      100 |      60 |   81.81 | 35-50             
 features/vehicles |   89.74 |    84.16 |   85.91 |   93.08 |                   
  FilterBar.tsx    |   81.25 |    58.33 |    62.5 |   82.14 | 47,78-95,114-124  
  ...aseButton.tsx |   92.59 |    82.35 |    90.9 |   95.65 | 44                
  ShowroomPage.tsx |   94.59 |    90.47 |   94.11 |   96.87 | 88                
  ...tailPanel.tsx |     100 |    66.66 |     100 |     100 | 31,91             
  filters.ts       |   91.42 |       90 |     100 |     100 | 25,47-49          
  useVehicles.ts   |   77.41 |    81.25 |   77.77 |    82.6 | 19-21,29          
 shared/lib        |   98.24 |       88 |   83.33 |      98 |                   
  api.ts           |   97.77 |       88 |      75 |   97.36 | 96                
 shared/ui         |   96.29 |    95.55 |   95.65 |   97.82 |                   
  Dialog.tsx       |     100 |    83.33 |     100 |     100 | 22                
  HeroPhoto.tsx    |   66.66 |      100 |      50 |   66.66 | 13                
  Toast.tsx        |   94.44 |       50 |     100 |     100 | 45                
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 86.05% ( 580/674 )
Branches     : 79.83% ( 297/372 )
Functions    : 83.68% ( 200/239 )
Lines        : 88.69% ( 510/575 )
================================================================================
```

The `app/` and `app/layouts/` files show 0% because the tests render pages and features directly, not the whole app shell. The frontend report covers every source file in `src/`, except the `main.tsx` entry point and the test helpers in `src/test/`.
