---
title: Rollback rehearsal
summary: A deliberately malformed post used once to prove the publish gate holds. Reverted immediately.
---

This post is missing its `date` field on purpose. The build must fail and name
both this file and the missing field, rather than skipping the file silently.
