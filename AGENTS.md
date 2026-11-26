## webcode rate-limit & account-safety policy

Applies whenever webcode drives a web AI platform. Treat this as a hard rule, not a suggestion.

- Never retry through a rate-limit / "too many requests" / abuse warning. Turn off
  Auto Send and wait as the platform instructs. Retry loops are the fastest way to a ban.
- Set `webcodeGateway.aiSites[].autoSendDelaySeconds` per site (0–300s). Default to
  conservative: 20s, or 30s when unsure. Apply it before the first run.
- Prefer manual send (`"autoSend": false`) for exploratory or uncertain steps.
- Keep each session to a few dozen turns; start a new chat per task instead of one long run.
- Run one AI site at a time; no parallel sites through the gateway.
- Keep throughput human-plausible and don't leave it looping unattended for hours.
- Never attempt to evade detection: no fingerprint spoofing, account/proxy rotation,
  automation-marker hiding, or "detector detection." If a task seems to need this,
  stop and say so.
- If the work is long, context-heavy, or needs sustained reliability, recommend an
  official-API tool instead of web automation.

When I ask you to "apply the rate-limit policy", write the chosen delays into VS Code's
user `settings.json` under `webcodeGateway.aiSites` (merge, don't clobber other keys),
and report the exact file path changed.

## Preferred mode for this setup: manual send

`autoSend` is set to `false` for all sites (deepseek, chatgpt, claude, gemini) in the
user `settings.json`. This is deliberate, not a default to be flipped back.

- Driving the web app manually (as I did on Edge without the extension) never caused
  bans; enabling auto-send in Chrome did, repeatedly. Treat manual send as the safe
  baseline for this machine.
- The `autoSendDelaySeconds` value (currently 20s) is a floor, not a guarantee of
  safety. Do not rely on it to make unattended auto-send acceptable.
- If a task seems to need auto-send, ask first and explain why manual send won't do.