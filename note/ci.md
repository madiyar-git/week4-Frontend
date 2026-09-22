# 🚀 Отчёт по настройке CI/CD и защиты веток (Branch Protection)

## 1. Статус Пайплайнов (CI Badges)

| Репозиторий  | Статус CI Пайплайна                                                                                                                                                        |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend**  | [![CI Pipeline](https://github.com/madiyar-git/Week4_Backend/actions/workflows/ci.yml/badge.svg)](https://github.com/madiyar-git/Week4_Backend/actions/workflows/ci.yml)   |
| **Frontend** | [![CI Pipeline](https://github.com/madiyar-git/week4-Frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/madiyar-git/week4-Frontend/actions/workflows/ci.yml) |

---

## 2. Конфигурация защиты ветки main (Branch Protection Rules)

Для обоих репозиториев (`Week4_Backend` и `week4-Frontend`) настроены следующие правила защиты основной ветки `main`:

1. **Require a pull request before merging**: Прямой пуш в ветку `main` заблокирован. Все изменения обязаны проходить через Pull Request.
2. **Require status checks to pass before merging**: Мёрж Pull Request заблокирован до тех пор, пока не завершатся успехом обязательные CI-проверки.
3. **Require branches to be up to date before merging**: Ветка PR должна содержать актуальный код из `main`.
4. **Do not allow bypassing the above settings**: Правила распространяются на всех участников, включая администраторов репозитория.
5. **Block force pushes & Prevent branch deletion**: Запрещён форс-пуш (`git push --force`) и удаление ветки `main`.

---

## 3. Подтверждение блокировки прямого пуша (Логи ошибок GH006)

### Бэкенд (Week4_Backend)

```
$ git push origin main
Enumerating objects: 13, done.
Counting objects: 100% (13/13), done.
Writing objects: 100% (10/10), 1.41 KiB | 288.00 KiB/s, done.
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote:
remote: - Changes must be made through a pull request.
remote:
remote: - 2 of 2 required status checks are expected.
To [https://github.com/madiyar-git/Week4_Backend.git](https://github.com/madiyar-git/Week4_Backend.git)
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to '[https://github.com/madiyar-git/Week4_Backend.git](https://github.com/madiyar-git/Week4_Backend.git)'
```

### Фронтенд (week4-Frontend)

```
$ git push origin main
Enumerating objects: 8, done.
Counting objects: 100% (8/8), done.
Writing objects: 100% (6/6), 1.06 KiB | 542.00 KiB/s, done.
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote:
remote: - Changes must be made through a pull request.
remote:
remote: - Required status check "Frontend CI" is expected.
To [https://github.com/madiyar-git/week4-Frontend.git](https://github.com/madiyar-git/week4-Frontend.git)
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to '[https://github.com/madiyar-git/week4-Frontend.git](https://github.com/madiyar-git/week4-Frontend.git)'
```

---

## 4. Обязательные проверки (Required Status Checks)

В настройках репозиториев в качестве обязательных статус-чеков привязаны следующие джобы GitHub Actions:

- **Backend:** `backend` / `Build Docker Image (Backend)`
- **Frontend:** `Frontend CI Pipeline / Frontend CI (pull_request)`

---

## 5. Проверка сценария «Красный → Зелёный CI»

1. **Тест со сбоем (Красный CI):**

- При внесении ошибочного кода или падающих тестов в отдельную ветку и открытии PR, статус-чек GitHub Actions завершается ошибкой.
- Кнопка **Merge pull request** автоматически блокируется с причиной `Required status checks failed`.

2. **Исправление кода (Зелёный CI):**

- После исправления упавших тестов локально и отправки нового коммита в ветку PR, GitHub Actions автоматически перезапускает проверку.
- После успешного прохождения проверки (`All checks have passed`) кнопка **Merge pull request** становится активной для мёржа.
