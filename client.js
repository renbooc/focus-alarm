window.__ModuleLoader__.load({
  id: '@local/offwork-countdown',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const KEY_SETTINGS = 'dsh.offwork-countdown.v1';
    const KEY_POMO = 'dsh.offwork-countdown.pomo.v1';
    const KEY_STATS = 'dsh.offwork-countdown.stats.v1';
    const KEY_FIRED = 'dsh.offwork-countdown.fired.v1';
    const KEY_POS = 'dsh.offwork-countdown.pos.v1';
    const KEY_MIN = 'dsh.offwork-countdown.min.v1';
    const DEFAULTS = {
      start: '09:00',
      end: '18:00',
      focus: 25,
      short: 5,
      long: 15,
      longEvery: 4,
      autoNext: false,
      sound: true,
      notify: false,
      titleSync: true,
      rhythm: true,
    };
    const CARD_W = 212;

    const DICTS = {
      zh: {
        title: '专注闹钟',
        tabOff: '下班',
        tabPomo: '番茄',
        tabStats: '统计',
        working: '距下班',
        before: '距上班',
        weekendNext: '距下个工作日',
        weekendNote: '周末愉快',
        overtime: '加班中',
        startLabel: '上班',
        endLabel: '下班',
        focusLabel: '专注中',
        shortLabel: '短休',
        longLabel: '长休',
        readyLabel: '待开始',
        run: '开始',
        pause: '暂停',
        skip: '跳过',
        restart: '重置',
        addFive: '+5',
        setFocus: '专注',
        setShort: '短休',
        setLong: '长休',
        setLongEvery: '长休间隔',
        minuteUnit: '分',
        roundsUnit: '轮',
        save: '完成',
        defaults: '默认',
        cancel: '取消',
        edit: '设置',
        minimize: '收起',
        expand: '展开',
        invalidTime: '下班时间需晚于上班时间',
        invalidMinutes: '分钟数超出范围',
        invalidRounds: '轮数需为 2–8',
        doneFocus: '专注完成 · 休息一下',
        doneBreak: '休息结束 · 继续专注',
        optSection: '偏好',
        optAuto: '自动开始下一阶段',
        optSound: '结束提示音',
        optNotify: '系统通知',
        optTitle: '标签页显示倒计时',
        optRhythm: '节律提醒',
        statsToday: '今日专注',
        statsUnitPomo: '个番茄',
        statsUnitMin: '分钟',
        statsAbandon: '打断',
        statsStreak: '连续',
        statsDays: '天',
        statsWeek: '近 7 天',
        statsBreaks: '休息',
        rhythmEnd30: '距下班还有 30 分钟，收个尾、写写日报吧',
        rhythmEndNow: '下班时间到，该走了',
        rhythmBreak: '起身走动、喝口水，看看 6 米外 20 秒',
        rhythmOvertime: '已经加班了，这个番茄结束就早点回去吧',
        week: ['日', '一', '二', '三', '四', '五', '六'],
      },
      en: {
        title: 'Focus Alarm',
        tabOff: 'Off duty',
        tabPomo: 'Pomodoro',
        tabStats: 'Stats',
        working: 'Until off work',
        before: 'Until work starts',
        weekendNext: 'Until next workday',
        weekendNote: 'Happy weekend',
        overtime: 'Overtime',
        startLabel: 'Start',
        endLabel: 'End',
        focusLabel: 'Focus',
        shortLabel: 'Short break',
        longLabel: 'Long break',
        readyLabel: 'Ready',
        run: 'Start',
        pause: 'Pause',
        skip: 'Skip',
        restart: 'Reset',
        addFive: '+5',
        setFocus: 'Focus',
        setShort: 'Short',
        setLong: 'Long',
        setLongEvery: 'Long break after',
        minuteUnit: 'min',
        roundsUnit: 'rounds',
        save: 'Done',
        defaults: 'Default',
        cancel: 'Cancel',
        edit: 'Settings',
        minimize: 'Minimize',
        expand: 'Expand',
        invalidTime: 'End must be later than start',
        invalidMinutes: 'Minutes out of range',
        invalidRounds: 'Rounds must be 2-8',
        doneFocus: 'Focus done · take a break',
        doneBreak: 'Break over · back to focus',
        optSection: 'Preferences',
        optAuto: 'Auto-start next phase',
        optSound: 'Completion chime',
        optNotify: 'System notification',
        optTitle: 'Show timer in tab title',
        optRhythm: 'Rhythm reminders',
        statsToday: 'Focus today',
        statsUnitPomo: 'pomodoros',
        statsUnitMin: 'min',
        statsAbandon: 'interrupted',
        statsStreak: 'streak',
        statsDays: 'd',
        statsWeek: 'Last 7 days',
        statsBreaks: 'breaks',
        rhythmEnd30: '30 min until off work — wrap up and write your notes',
        rhythmEndNow: 'Time to clock out',
        rhythmBreak: 'Stand up, drink some water, look 20 ft away for 20 s',
        rhythmOvertime: 'You are on overtime — call it a day after this one',
        week: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      },
    };

    let locale = null;
    let audioCtx = null;
    const langListeners = new Set();

    function pad2(n) {
      return n < 10 ? '0' + n : String(n);
    }

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function numOr(value, fallback) {
      const n = Number(value);
      return isFinite(n) ? n : fallback;
    }

    function intOr(value, fallback, lo, hi) {
      const n = Number(value);
      if (!isFinite(n)) return fallback;
      return Math.round(clamp(n, lo, hi));
    }

    function dateKeyOf(dt) {
      return dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate());
    }

    function dateKey() {
      return dateKeyOf(new Date());
    }

    function toMinutes(value, fallback) {
      const m = /^(\d{1,2}):(\d{2})$/.exec(String(value == null ? '' : value).trim());
      if (!m) return fallback;
      const hh = Number(m[1]);
      const mm = Number(m[2]);
      if (!(hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59)) return fallback;
      return hh * 60 + mm;
    }

    function fromMinutes(total) {
      const v = ((total % 1440) + 1440) % 1440;
      return pad2(Math.floor(v / 60)) + ':' + pad2(v % 60);
    }

    const START_FALLBACK = toMinutes(DEFAULTS.start, 540);
    const END_FALLBACK = toMinutes(DEFAULTS.end, 1080);

    function durationText(ms) {
      const total = Math.max(0, Math.floor(ms / 1000));
      const hh = Math.floor(total / 3600);
      const mm = Math.floor((total % 3600) / 60);
      const ss = total % 60;
      return (hh < 10 ? '0' + hh : String(hh)) + ':' + pad2(mm) + ':' + pad2(ss);
    }

    function clockText(ms) {
      const total = Math.max(0, Math.ceil(ms / 1000));
      const hh = Math.floor(total / 3600);
      const mm = Math.floor((total % 3600) / 60);
      const ss = total % 60;
      if (hh > 0) return hh + ':' + pad2(mm) + ':' + pad2(ss);
      return pad2(mm) + ':' + pad2(ss);
    }

    function readJSON(key) {
      try {
        return JSON.parse(window.localStorage.getItem(key) || 'null');
      } catch (e) {
        return null;
      }
    }

    function writeJSON(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        /* Storage may be unavailable; the in-memory value still applies. */
      }
    }

    function readSettings() {
      const raw = readJSON(KEY_SETTINGS);
      const src = raw && typeof raw === 'object' ? raw : {};
      return {
        start: fromMinutes(toMinutes(src.start, START_FALLBACK)),
        end: fromMinutes(toMinutes(src.end, END_FALLBACK)),
        focus: intOr(src.focus, DEFAULTS.focus, 1, 120),
        short: intOr(src.short, DEFAULTS.short, 1, 60),
        long: intOr(src.long, DEFAULTS.long, 1, 180),
        longEvery: intOr(src.longEvery, DEFAULTS.longEvery, 2, 8),
        autoNext: src.autoNext === true,
        sound: src.sound !== false,
        notify: src.notify === true,
        titleSync: src.titleSync !== false,
        rhythm: src.rhythm !== false,
      };
    }

    function phaseMs(settings, phase) {
      const minutes =
        phase === 'short'
          ? settings.short
          : phase === 'long'
            ? settings.long
            : settings.focus;
      return Math.max(1, numOr(minutes, DEFAULTS.focus)) * 60000;
    }

    function advance(phase, round, longEvery) {
      if (phase === 'focus') {
        const done = Math.min(longEvery, round + 1);
        return done >= longEvery
          ? { phase: 'long', round: longEvery }
          : { phase: 'short', round: done };
      }
      if (phase === 'long') return { phase: 'focus', round: 0 };
      return { phase: 'focus', round: round };
    }

    function readPomo(settings) {
      const raw = readJSON(KEY_POMO);
      const src = raw && typeof raw === 'object' ? raw : {};
      const phase =
        src.phase === 'short' || src.phase === 'long' ? src.phase : 'focus';
      const round = intOr(src.round, 0, 0, 8);
      const total = phaseMs(settings, phase);

      if (src.running) {
        const endsAt = numOr(src.endsAt, 0);
        if (endsAt > Date.now()) {
          return {
            phase: phase,
            round: round,
            running: true,
            endsAt: endsAt,
            remaining: Math.max(0, endsAt - Date.now()),
            startedRemaining: numOr(src.startedRemaining, total),
          };
        }
        const next = advance(phase, round, settings.longEvery);
        return {
          phase: next.phase,
          round: next.round,
          running: false,
          endsAt: null,
          remaining: phaseMs(settings, next.phase),
          startedRemaining: null,
        };
      }

      let remaining = numOr(src.remaining, total);
      if (!(remaining > 0)) remaining = total;
      return {
        phase: phase,
        round: round,
        running: false,
        endsAt: null,
        remaining: remaining,
        startedRemaining: null,
      };
    }

    // Every launch opens on a fresh Pomodoro focus phase: full duration,
    // empty round dots, ready to start. The one state we resume is an
    // actively running timer, so a session started before the restart is
    // never silently thrown away. Paused or expired sessions are discarded.
    function startupPomo(settings) {
      const saved = readPomo(settings);
      if (saved.running && saved.endsAt && saved.endsAt > Date.now()) {
        return saved;
      }
      return {
        phase: 'focus',
        round: 0,
        running: false,
        endsAt: null,
        remaining: phaseMs(settings, 'focus'),
        startedRemaining: null,
      };
    }

    function readStats() {
      const today = dateKey();
      const raw = readJSON(KEY_STATS);
      const history =
        raw && raw.history && typeof raw.history === 'object' ? raw.history : {};
      if (!raw || typeof raw !== 'object' || raw.date !== today) {
        return {
          date: today,
          done: 0,
          focusMs: 0,
          abandoned: 0,
          breaks: 0,
          history: history,
        };
      }
      return {
        date: today,
        done: intOr(raw.done, 0, 0, 9999),
        focusMs: Math.max(0, numOr(raw.focusMs, 0)),
        abandoned: intOr(raw.abandoned, 0, 0, 9999),
        breaks: intOr(raw.breaks, 0, 0, 9999),
        history: history,
      };
    }

    function readFired() {
      const raw = readJSON(KEY_FIRED);
      if (raw && typeof raw === 'object' && raw.date === dateKey()) {
        return { date: raw.date, keys: raw.keys && typeof raw.keys === 'object' ? raw.keys : {} };
      }
      return { date: dateKey(), keys: {} };
    }

    function readMinimized() {
      return readJSON(KEY_MIN) === true;
    }

    function readPos() {
      const raw = readJSON(KEY_POS);
      if (!raw || typeof raw !== 'object') return null;
      const left = Number(raw.left);
      const top = Number(raw.top);
      if (!isFinite(left) || !isFinite(top)) return null;
      return {
        left: Math.round(clamp(left, 4, Math.max(4, window.innerWidth - CARD_W - 4))),
        top: Math.round(clamp(top, 4, Math.max(4, window.innerHeight - 60))),
      };
    }

    function currentDict() {
      let raw = '';
      if (locale) {
        try {
          const snap = locale.getLocale();
          raw = String(
            (snap && (snap.active || snap.id || snap.locale || snap.language)) || '',
          ).toLowerCase();
        } catch (e) {
          raw = '';
        }
      }
      if (!raw) return DICTS.zh;
      return raw.indexOf('zh') === 0 ? DICTS.zh : DICTS.en;
    }

    function useDict() {
      const [, setTick] = React.useState(0);
      React.useEffect(function () {
        const notify = function () {
          setTick(function (v) {
            return v + 1;
          });
        };
        langListeners.add(notify);
        return function () {
          langListeners.delete(notify);
        };
      }, []);
      return currentDict();
    }

    function ensureAudio() {
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return null;
        if (!audioCtx) audioCtx = new Ctor();
        if (audioCtx.state === 'suspended' && audioCtx.resume) audioCtx.resume();
        return audioCtx;
      } catch (e) {
        return null;
      }
    }

    function playChime() {
      const ac = ensureAudio();
      if (!ac) return;
      try {
        const t0 = ac.currentTime;
        const notes = [784, 1046.5];
        for (let i = 0; i < notes.length; i += 1) {
          const at = t0 + i * 0.22;
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = 'sine';
          osc.frequency.value = notes[i];
          gain.gain.setValueAtTime(0.0001, at);
          gain.gain.exponentialRampToValueAtTime(0.16, at + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);
          osc.connect(gain).connect(ac.destination);
          osc.start(at);
          osc.stop(at + 0.32);
        }
      } catch (e) {
        /* Audio is best-effort. */
      }
    }

    function offWorkState(now, settings, d) {
      const startMin = toMinutes(settings.start, START_FALLBACK);
      const endMin = toMinutes(settings.end, END_FALLBACK);
      const date = new Date(now);
      const midnight = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      ).getTime();
      const startAt = midnight + startMin * 60000;
      const endAt = midnight + endMin * 60000;
      const day = date.getDay();

      if (day === 0 || day === 6) {
        const ahead = day === 6 ? 2 : 1;
        const next = midnight + ahead * 86400000 + startMin * 60000;
        return {
          mode: 'weekend',
          label: d.weekendNext,
          value: durationText(next - now),
          note: d.weekendNote,
          progress: 0,
          leftMs: next - now,
          accent: 'var(--dsw-alias-state-idle-primary)',
        };
      }
      if (now < startAt) {
        return {
          mode: 'before',
          label: d.before,
          value: durationText(startAt - now),
          note: '',
          progress: 0,
          leftMs: startAt - now,
          accent: 'var(--dsw-alias-state-idle-primary)',
        };
      }
      if (now >= endAt) {
        return {
          mode: 'overtime',
          label: d.overtime,
          value: '+' + durationText(now - endAt),
          note: '',
          progress: 1,
          leftMs: endAt - now,
          accent: 'var(--dsw-alias-state-success-primary)',
        };
      }
      const span = Math.max(60000, endAt - startAt);
      const left = endAt - now;
      return {
        mode: 'working',
        label: d.working,
        value: durationText(left),
        note: '',
        progress: Math.min(1, Math.max(0, (now - startAt) / span)),
        leftMs: left,
        accent:
          left <= 1800000
            ? 'var(--dsw-alias-state-warn-primary)'
            : 'var(--dsw-alias-brand-primary)',
      };
    }

    const SHADOW =
      '0 10px 30px color-mix(in srgb, var(--dsw-alias-label-primary) 16%, transparent)';

    const CSS = [
      '.owc-card{position:fixed;box-sizing:border-box;width:' + CARD_W + 'px;padding:9px 12px 11px;border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font:inherit;user-select:none;pointer-events:auto;box-shadow:' + SHADOW + ';backdrop-filter:blur(10px)}',
      '.owc-head{display:flex;align-items:center;gap:4px;margin:-4px 0 5px;cursor:grab;touch-action:none}',
      '.owc-head:active{cursor:grabbing}',
      '.owc-tabs{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:8px;background:var(--dsw-alias-bg-layer-2)}',
      '.owc-tab{box-sizing:border-box;height:18px;margin:0;padding:0 6px;border:0;border-radius:6px;background:none;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;line-height:18px;cursor:pointer;white-space:nowrap}',
      '.owc-tab:hover{color:var(--dsw-alias-label-primary)}',
      '.owc-tab-on{background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font-weight:600}',
      '.owc-tab:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.owc-spacer{flex:1 1 auto}',
      '.owc-icon{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;margin:0;padding:0;border:0;border-radius:5px;background:none;color:var(--dsw-alias-label-secondary);cursor:pointer;flex:none}',
      '.owc-icon:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.owc-icon:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.owc-caption{font-size:11px;color:var(--dsw-alias-label-secondary)}',
      '.owc-big{font-size:27px;line-height:1.12;font-weight:600;font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1;letter-spacing:.01em;margin:1px 0 8px}',
      '.owc-note{font-size:11px;color:var(--dsw-alias-label-secondary);margin:-5px 0 7px}',
      '.owc-track{height:4px;border-radius:999px;background:var(--dsw-alias-border-l1);overflow:hidden}',
      '.owc-fill{height:100%;border-radius:999px;transition:width 700ms linear}',
      '.owc-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;font-size:11px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;min-height:22px}',
      '.owc-dots{display:inline-flex;align-items:center;gap:3px;flex-wrap:wrap;max-width:72px}',
      '.owc-dot{display:block;width:5px;height:5px;border-radius:999px;background:var(--dsw-alias-border-l2)}',
      '.owc-dot-on{background:var(--dsw-alias-brand-primary)}',
      '.owc-controls{display:inline-flex;align-items:center;gap:2px}',
      '.owc-btn{box-sizing:border-box;height:24px;margin:0;padding:0 8px;border:1px solid transparent;border-radius:7px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:11.5px;line-height:22px;cursor:pointer;white-space:nowrap}',
      '.owc-btn:hover{background:var(--dsw-alias-bg-layer-1)}',
      '.owc-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
      '.owc-btn-sm{flex:0 0 auto;height:22px;padding:0 9px;font-size:11px;line-height:20px}',
      '.owc-primary{background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-bg-base)}',
      '.owc-primary:hover{background:var(--dsw-alias-brand-primary)}',
      '.owc-primary:disabled{opacity:.45;cursor:not-allowed}',
      '.owc-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 6px}',
      '.owc-field{display:inline-flex;align-items:center;gap:5px}',
      '.owc-unit{font-size:11px;color:var(--dsw-alias-label-secondary)}',
      '.owc-input{box-sizing:border-box;width:98px;height:24px;margin:0;padding:0 6px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;font-variant-numeric:tabular-nums}',
      '.owc-input-num{width:50px;text-align:center}',
      '.owc-input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:0}',
      '.owc-hint{font-size:11px;color:var(--dsw-alias-state-error-primary);margin:0 0 6px}',
      '.owc-actions{display:flex;gap:6px;margin-top:9px}',
      '.owc-actions .owc-btn{flex:1 1 0}',
      '.owc-edit{max-height:290px;overflow-y:auto;overscroll-behavior:contain;padding-right:2px;scrollbar-width:thin}',
      '.owc-section{font-size:10px;letter-spacing:.06em;color:var(--dsw-alias-label-secondary);margin:9px 0 6px;padding-top:7px;border-top:1px solid var(--dsw-alias-border-l1)}',
      '.owc-opt{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 5px;min-height:20px}',
      '.owc-opt-label{font-size:11px;color:var(--dsw-alias-label-primary)}',
      '.owc-switch{position:relative;box-sizing:border-box;width:28px;height:16px;margin:0;padding:0;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-alias-bg-layer-2);cursor:pointer;flex:none;transition:background 140ms ease}',
      '.owc-switch-on{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}',
      '.owc-knob{position:absolute;left:2px;top:2px;width:10px;height:10px;border-radius:999px;background:var(--dsw-alias-label-secondary);transition:transform 140ms ease}',
      '.owc-switch-on .owc-knob{transform:translateX(12px);background:var(--dsw-alias-bg-base)}',
      '.owc-switch:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.owc-note-banner{box-sizing:border-box;margin:0 0 7px;padding:5px 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-2);font-size:11px;line-height:1.45;color:var(--dsw-alias-label-primary);animation:owc-note-in 240ms ease;pointer-events:auto}',
      '.owc-tone-warn{border-color:var(--dsw-alias-state-warn-primary)}',
      '.owc-tone-success{border-color:var(--dsw-alias-state-success-primary)}',
      '@keyframes owc-note-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}',
      '.owc-stats-num{font-size:27px;line-height:1.2;font-weight:600;font-variant-numeric:tabular-nums;margin:2px 0 3px}',
      '.owc-stats-unit{font-size:11px;font-weight:400;color:var(--dsw-alias-label-secondary);margin-left:5px}',
      '.owc-stats-line{font-size:11px;color:var(--dsw-alias-label-secondary);margin:0 0 9px}',
      '.owc-week{display:flex;align-items:flex-end;gap:5px;height:48px}',
      '.owc-day{flex:1 1 0;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%;justify-content:flex-end}',
      '.owc-bar{width:100%;max-width:18px;min-height:2px;border-radius:3px 3px 1px 1px;background:var(--dsw-alias-brand-primary);opacity:.85}',
      '.owc-bar-empty{background:var(--dsw-alias-border-l2);opacity:1}',
      '.owc-day-label{font-size:9px;color:var(--dsw-alias-label-secondary)}',
      '.owc-mini{position:fixed;box-sizing:border-box;display:inline-flex;align-items:center;gap:7px;margin:0;padding:5px 11px 5px 9px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;cursor:pointer;pointer-events:auto;box-shadow:' + SHADOW + ';backdrop-filter:blur(10px)}',
      '.owc-mini:hover{background:var(--dsw-alias-bg-layer-1)}',
      '.owc-mini:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.owc-mini-time{font-variant-numeric:tabular-nums;font-weight:600;font-size:12.5px;letter-spacing:.01em}',
      '.owc-mini-label{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap}',
      '.owc-shake{animation:owc-shake 640ms cubic-bezier(.36,.07,.19,.97) 1}',
      '@keyframes owc-shake{0%,100%{transform:translate3d(0,0,0) rotate(0)}15%{transform:translate3d(-5px,0,0) rotate(-1.4deg)}30%{transform:translate3d(5px,0,0) rotate(1.4deg)}45%{transform:translate3d(-3.5px,0,0) rotate(-.9deg)}62%{transform:translate3d(3.5px,0,0) rotate(.9deg)}80%{transform:translate3d(-1.5px,0,0) rotate(-.3deg)}}',
      '.owc-burst{position:absolute;left:50%;top:50%;width:0;height:0;pointer-events:none;z-index:2}',
      '.owc-spark{position:absolute;left:0;top:0;border-radius:999px;opacity:0;animation:owc-spark 900ms cubic-bezier(.16,.84,.44,1) forwards;animation-delay:var(--d)}',
      '@keyframes owc-spark{0%{opacity:0;transform:translate(-50%,-50%) scale(.35)}10%{opacity:1}75%{opacity:.85}100%{opacity:0;transform:translate(calc(-50% + var(--x)),calc(-50% + var(--y))) scale(.85)}}',
      '.owc-flash{position:absolute;left:50%;bottom:calc(100% + 8px);box-sizing:border-box;padding:4px 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font-size:11px;line-height:16px;white-space:nowrap;pointer-events:none;box-shadow:0 6px 18px color-mix(in srgb, var(--dsw-alias-label-primary) 14%, transparent);animation:owc-flash 1900ms ease forwards}',
      '@keyframes owc-flash{0%{opacity:0;transform:translate(-50%,6px) scale(.96)}14%{opacity:1;transform:translate(-50%,0) scale(1)}72%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,-8px) scale(.98)}}',
      '@media (prefers-reduced-motion: reduce){.owc-shake{animation:none}.owc-spark{display:none}}',
    ].join('');

    function Ring(props) {
      const r = 7;
      const c = 2 * Math.PI * r;
      const p = clamp(props.progress, 0, 1);
      return h(
        'svg',
        {
          width: 18,
          height: 18,
          viewBox: '0 0 18 18',
          'aria-hidden': 'true',
          style: { display: 'block', flex: 'none' },
        },
        h('circle', {
          cx: 9,
          cy: 9,
          r: r,
          fill: 'none',
          strokeWidth: 2.5,
          style: { stroke: 'var(--dsw-alias-border-l1)' },
        }),
        h('circle', {
          cx: 9,
          cy: 9,
          r: r,
          fill: 'none',
          strokeWidth: 2.5,
          strokeLinecap: 'round',
          strokeDasharray: c,
          strokeDashoffset: c * (1 - p),
          transform: 'rotate(-90 9 9)',
          style: {
            stroke: props.accent,
            transition: 'stroke-dashoffset 600ms linear',
          },
        }),
      );
    }

    function IconGear() {
      return h(
        'svg',
        { width: 12, height: 12, viewBox: '0 0 16 16', 'aria-hidden': 'true' },
        h('circle', {
          cx: 8,
          cy: 8,
          r: 2.5,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.4,
        }),
        h('path', {
          d: 'M8 1.4v1.5M8 13.1v1.5M1.4 8h1.5M13.1 8h1.5M3.3 3.3l1.1 1.1M11.6 11.6l1.1 1.1M12.7 3.3l-1.1 1.1M4.4 11.6l-1.1 1.1',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.3,
          strokeLinecap: 'round',
        }),
      );
    }

    function IconMinus() {
      return h(
        'svg',
        { width: 12, height: 12, viewBox: '0 0 16 16', 'aria-hidden': 'true' },
        h('path', {
          d: 'M3.5 8h9',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
        }),
      );
    }

    function IconSkip() {
      return h(
        'svg',
        { width: 12, height: 12, viewBox: '0 0 16 16', 'aria-hidden': 'true' },
        h('path', { d: 'M4 3.4 10 8 4 12.6Z', fill: 'currentColor' }),
        h('path', {
          d: 'M11.6 3.4v9.2',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
        }),
      );
    }

    function IconRestart() {
      return h(
        'svg',
        { width: 12, height: 12, viewBox: '0 0 16 16', 'aria-hidden': 'true' },
        h('path', {
          d: 'M13 8a5 5 0 1 1-1.6-3.7',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M5.4 1.4 8 3 5.4 4.9',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.5,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      );
    }

    function Switch(props) {
      return h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': props.value ? 'true' : 'false',
          'aria-label': props.label,
          className: 'owc-switch' + (props.value ? ' owc-switch-on' : ''),
          onClick: props.onToggle,
        },
        h('span', { className: 'owc-knob' }),
      );
    }

    function anchorStyle(pos, fallback) {
      if (pos && typeof pos.left === 'number' && typeof pos.top === 'number') {
        return {
          left: pos.left + 'px',
          top: pos.top + 'px',
          right: 'auto',
          bottom: 'auto',
        };
      }
      return fallback;
    }

    function toDraft(s) {
      return {
        start: s.start,
        end: s.end,
        focus: String(s.focus),
        short: String(s.short),
        long: String(s.long),
        longEvery: String(s.longEvery),
        autoNext: !!s.autoNext,
        sound: !!s.sound,
        notify: !!s.notify,
        titleSync: !!s.titleSync,
        rhythm: !!s.rhythm,
      };
    }

    const SPARK_COLORS = [
      'var(--dsw-alias-brand-primary)',
      'var(--dsw-alias-state-success-primary)',
      'var(--dsw-alias-state-warn-primary)',
      'var(--dsw-alias-state-error-primary)',
    ];

    function makeBurst(mode) {
      const parts = [];
      const count = 20;
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const dist = 40 + Math.random() * 48;
        parts.push({
          key: 'spark' + i,
          x: Math.round(Math.cos(angle) * dist),
          y: Math.round(Math.sin(angle) * dist * 0.75 + 16),
          delay: Math.round(Math.random() * 140),
          size: (4 + Math.random() * 3.5).toFixed(1),
          color: SPARK_COLORS[i % SPARK_COLORS.length],
        });
      }
      return { id: Date.now(), mode: mode, parts: parts };
    }

    function FloatCountdown() {
      const d = useDict();
      const [now, setNow] = React.useState(function () {
        return Date.now();
      });
      const [settings, setSettings] = React.useState(readSettings);
      const [pomo, setPomo] = React.useState(function () {
        return startupPomo(settings);
      });
      const [stats, setStats] = React.useState(readStats);
      const [tab, setTab] = React.useState('pomo');
      const [editing, setEditing] = React.useState(false);
      const [draft, setDraft] = React.useState(function () {
        return toDraft(settings);
      });
      const [invalid, setInvalid] = React.useState('');
      const [minimized, setMinimized] = React.useState(readMinimized);
      const [pos, setPos] = React.useState(readPos);
      const [burst, setBurst] = React.useState(null);
      const [note, setNote] = React.useState(null);

      const drag = React.useRef(null);
      const posRef = React.useRef(pos);
      posRef.current = pos;
      const statsRef = React.useRef(stats);
      statsRef.current = stats;
      const firedRef = React.useRef(readFired());
      const titleBaseRef = React.useRef(null);
      const titleLastRef = React.useRef(null);

      React.useEffect(
        function () {
          const tick = function () {
            setNow(Date.now());
          };
          const timer = window.setInterval(tick, 1000);
          const wake = function () {
            if (!document.hidden) tick();
          };
          const onVisible = function () {
            if (!document.hidden) {
              const cur = statsRef.current;
              if (cur.date !== dateKey()) {
                const fresh = readStats();
                statsRef.current = fresh;
                setStats(fresh);
              }
              tick();
            }
          };
          window.addEventListener('focus', onVisible);
          document.addEventListener('visibilitychange', onVisible);
          return function () {
            window.clearInterval(timer);
            window.removeEventListener('focus', onVisible);
            document.removeEventListener('visibilitychange', onVisible);
          };
        },
        [],
      );

      React.useEffect(
        function () {
          return function () {
            if (
              titleLastRef.current !== null &&
              titleBaseRef.current !== null &&
              document.title === titleLastRef.current
            ) {
              document.title = titleBaseRef.current;
            }
            titleBaseRef.current = null;
            titleLastRef.current = null;
          };
        },
        [],
      );

      function updatePomo(next) {
        setPomo(next);
        writeJSON(KEY_POMO, next);
      }

      function updateStats(fn) {
        let prev = statsRef.current;
        const today = dateKey();
        if (prev.date !== today) prev = readStats();
        const next = Object.assign({}, fn(prev), { date: today });
        next.history = Object.assign({}, prev.history, { [today]: next.done });
        statsRef.current = next;
        setStats(next);
        writeJSON(KEY_STATS, next);
      }

      function markFired(key) {
        const today = dateKey();
        if (firedRef.current.date !== today) {
          firedRef.current = { date: today, keys: {} };
        }
        if (firedRef.current.keys[key]) return false;
        firedRef.current.keys[key] = true;
        writeJSON(KEY_FIRED, firedRef.current);
        return true;
      }

      function notifySystem(text) {
        if (!settings.notify) return;
        try {
          if (!window.Notification || window.Notification.permission !== 'granted') return;
          const n = new window.Notification(d.title, { body: text, tag: 'owc-timer' });
          window.setTimeout(function () {
            if (n.close) n.close();
          }, 8000);
        } catch (e) {
          /* Notifications are best-effort. */
        }
      }

      function fireNote(text, tone, dedupeKey) {
        if (dedupeKey && !markFired(dedupeKey)) return;
        setNote({ id: Date.now() + Math.random(), text: text, tone: tone });
        notifySystem(text);
      }

      function creditFocus(ms) {
        if (!(ms > 0)) return;
        updateStats(function (s) {
          return Object.assign({}, s, { focusMs: s.focusMs + ms });
        });
      }

      function focusElapsed() {
        if (!pomo.running || !pomo.endsAt) return 0;
        const rem = Math.max(0, pomo.endsAt - Date.now());
        const started = numOr(pomo.startedRemaining, phaseMs(settings, pomo.phase));
        return Math.max(0, started - rem);
      }

      function abandonFocus() {
        if (pomo.phase !== 'focus') return;
        const el = focusElapsed();
        creditFocus(el);
        if (el > 0 || pomo.remaining < phaseMs(settings, 'focus')) {
          updateStats(function (s) {
            return Object.assign({}, s, { abandoned: s.abandoned + 1 });
          });
        }
      }

      function completePhase() {
        const prev = pomo;
        const wasFocus = prev.phase === 'focus';
        const credit = numOr(prev.startedRemaining, phaseMs(settings, prev.phase));
        if (wasFocus) {
          updateStats(function (s) {
            return Object.assign({}, s, { done: s.done + 1, focusMs: s.focusMs + credit });
          });
        } else {
          updateStats(function (s) {
            return Object.assign({}, s, { breaks: s.breaks + 1 });
          });
        }

        if (settings.sound) playChime();
        const text = wasFocus ? d.doneFocus : d.doneBreak;
        setBurst(makeBurst(wasFocus ? 'break' : 'focus'));
        setTab('pomo');
        setMinimized(false);
        writeJSON(KEY_MIN, false);
        notifySystem(text);

        const next = advance(prev.phase, prev.round, settings.longEvery);
        const nextMs = phaseMs(settings, next.phase);
        const auto = settings.autoNext;
        updatePomo({
          phase: next.phase,
          round: next.round,
          running: auto,
          endsAt: auto ? Date.now() + nextMs : null,
          remaining: nextMs,
          startedRemaining: auto ? nextMs : null,
        });

        if (settings.rhythm && wasFocus) {
          const st = offWorkState(Date.now(), settings, d);
          if (st.mode === 'overtime') {
            fireNote(d.rhythmOvertime, 'warn', 'overtime-' + dateKey());
          } else {
            fireNote(d.rhythmBreak, 'success');
          }
        }
      }

      React.useEffect(
        function () {
          if (!pomo.running || !pomo.endsAt) return;
          if (now < pomo.endsAt) return;
          completePhase();
        },
        [now, pomo],
      );

      React.useEffect(
        function () {
          if (!burst) return undefined;
          const timer = window.setTimeout(function () {
            setBurst(null);
          }, 2100);
          return function () {
            window.clearTimeout(timer);
          };
        },
        [burst],
      );

      React.useEffect(
        function () {
          if (!note) return undefined;
          const timer = window.setTimeout(function () {
            setNote(null);
          }, 9000);
          return function () {
            window.clearTimeout(timer);
          };
        },
        [note],
      );

      React.useEffect(
        function () {
          if (!settings.rhythm) return;
          const st = offWorkState(now, settings, d);
          if (st.mode === 'working' && st.leftMs > 0 && st.leftMs <= 30 * 60000) {
            fireNote(d.rhythmEnd30, 'warn', 'end30');
          }
          if (st.mode === 'overtime') {
            fireNote(d.rhythmEndNow, 'warn', 'endNow');
          }
        },
        [now, settings.rhythm],
      );

      const offSt = offWorkState(now, settings, d);
      const totalMs = phaseMs(settings, pomo.phase);
      const leftMs =
        pomo.running && pomo.endsAt
          ? Math.max(0, pomo.endsAt - now)
          : Math.max(0, pomo.remaining);
      const phaseProgress = totalMs > 0 ? clamp(1 - leftMs / totalMs, 0, 1) : 0;
      const phaseAccent =
        pomo.phase === 'focus'
          ? 'var(--dsw-alias-brand-primary)'
          : 'var(--dsw-alias-state-success-primary)';
      const phaseLabel =
        pomo.phase === 'short'
          ? d.shortLabel
          : pomo.phase === 'long'
            ? d.longLabel
            : d.focusLabel;

      React.useEffect(
        function () {
          const active = settings.titleSync && pomo.running && !!pomo.endsAt;
          if (!active) {
            if (titleBaseRef.current !== null) {
              if (document.title === titleLastRef.current) {
                document.title = titleBaseRef.current;
              }
              titleBaseRef.current = null;
              titleLastRef.current = null;
            }
            return;
          }
          if (titleBaseRef.current === null) {
            titleBaseRef.current = document.title;
          } else if (document.title !== titleLastRef.current) {
            // The shell changed its own title (e.g. a new Session): adopt it
            // as the base instead of clobbering it with our countdown prefix.
            titleBaseRef.current = document.title;
          }
          const composed =
            clockText(leftMs) + ' · ' + phaseLabel + ' | ' + titleBaseRef.current;
          titleLastRef.current = composed;
          document.title = composed;
        },
        [settings.titleSync, pomo.running, pomo.endsAt, leftMs, phaseLabel],
      );

      function onPointerDown(e) {
        if (e.button !== 0) return;
        const target = e.target;
        if (target && target.closest && target.closest('button, input, a')) return;
        const card = e.currentTarget.parentNode;
        if (!card || !card.getBoundingClientRect) return;
        const rect = card.getBoundingClientRect();
        drag.current = {
          dx: e.clientX - rect.left,
          dy: e.clientY - rect.top,
          w: rect.width,
          h: rect.height,
        };
        if (e.currentTarget.setPointerCapture) {
          e.currentTarget.setPointerCapture(e.pointerId);
        }
        e.preventDefault();
      }

      function onPointerMove(e) {
        const s = drag.current;
        if (!s) return;
        setPos({
          left: Math.round(
            clamp(e.clientX - s.dx, 4, Math.max(4, window.innerWidth - s.w - 4)),
          ),
          top: Math.round(
            clamp(e.clientY - s.dy, 4, Math.max(4, window.innerHeight - s.h - 4)),
          ),
        });
      }

      function onPointerUp() {
        if (!drag.current) return;
        drag.current = null;
        writeJSON(KEY_POS, posRef.current);
      }

      function openSettings() {
        setDraft(toDraft(settings));
        setInvalid('');
        setEditing(true);
      }

      function closeSettings() {
        setEditing(false);
        setInvalid('');
      }

      function validate(x) {
        if (toMinutes(x.end, END_FALLBACK) <= toMinutes(x.start, START_FALLBACK)) {
          return d.invalidTime;
        }
        if (
          !(Number(x.focus) >= 1 && Number(x.focus) <= 120) ||
          !(Number(x.short) >= 1 && Number(x.short) <= 60) ||
          !(Number(x.long) >= 1 && Number(x.long) <= 180)
        ) {
          return d.invalidMinutes;
        }
        if (!(Number(x.longEvery) >= 2 && Number(x.longEvery) <= 8)) {
          return d.invalidRounds;
        }
        return '';
      }

      function change(key, value) {
        const next = Object.assign({}, draft, { [key]: value });
        setDraft(next);
        setInvalid(validate(next));
      }

      function toggleSetting(key) {
        const value = !draft[key];
        const nextDraft = Object.assign({}, draft, { [key]: value });
        setDraft(nextDraft);
        setInvalid(validate(nextDraft));
        const nextSettings = Object.assign({}, settings, { [key]: value });
        setSettings(nextSettings);
        writeJSON(KEY_SETTINGS, nextSettings);
        if (key === 'notify' && value && window.Notification && window.Notification.permission === 'default') {
          try {
            const p = window.Notification.requestPermission();
            if (p && p.catch) p.catch(function () {});
          } catch (e) {
            /* Permission prompt is best-effort. */
          }
        }
        if (key === 'sound' && value) ensureAudio();
      }

      function commit() {
        const next = {
          start: fromMinutes(toMinutes(draft.start, START_FALLBACK)),
          end: fromMinutes(toMinutes(draft.end, END_FALLBACK)),
          focus: intOr(draft.focus, DEFAULTS.focus, 1, 120),
          short: intOr(draft.short, DEFAULTS.short, 1, 60),
          long: intOr(draft.long, DEFAULTS.long, 1, 180),
          longEvery: intOr(draft.longEvery, DEFAULTS.longEvery, 2, 8),
          autoNext: !!draft.autoNext,
          sound: !!draft.sound,
          notify: !!draft.notify,
          titleSync: !!draft.titleSync,
          rhythm: !!draft.rhythm,
        };
        const problem = validate(next);
        if (problem) {
          setInvalid(problem);
          return;
        }
        writeJSON(KEY_SETTINGS, next);
        setSettings(next);
        if (!pomo.running) {
          updatePomo({
            phase: pomo.phase,
            round: Math.min(pomo.round, next.longEvery),
            running: false,
            endsAt: null,
            remaining: phaseMs(next, pomo.phase),
            startedRemaining: null,
          });
        }
        setEditing(false);
        setInvalid('');
      }

      function resetAll() {
        const next = Object.assign({}, DEFAULTS);
        writeJSON(KEY_SETTINGS, next);
        setSettings(next);
        setDraft(toDraft(next));
        setEditing(false);
        setInvalid('');
      }

      function toggleRun() {
        ensureAudio();
        if (pomo.running && pomo.endsAt) {
          const rem = Math.max(0, pomo.endsAt - Date.now());
          if (pomo.phase === 'focus') creditFocus(focusElapsed());
          updatePomo({
            phase: pomo.phase,
            round: pomo.round,
            running: false,
            endsAt: null,
            remaining: rem,
            startedRemaining: null,
          });
          return;
        }
        const rem = pomo.remaining > 0 ? pomo.remaining : totalMs;
        updatePomo({
          phase: pomo.phase,
          round: pomo.round,
          running: true,
          endsAt: Date.now() + rem,
          remaining: rem,
          startedRemaining: rem,
        });
      }

      function skipPhase() {
        abandonFocus();
        const next = advance(pomo.phase, pomo.round, settings.longEvery);
        updatePomo({
          phase: next.phase,
          round: next.round,
          running: false,
          endsAt: null,
          remaining: phaseMs(settings, next.phase),
          startedRemaining: null,
        });
      }

      function restartPhase() {
        abandonFocus();
        updatePomo({
          phase: pomo.phase,
          round: pomo.round,
          running: false,
          endsAt: null,
          remaining: phaseMs(settings, pomo.phase),
          startedRemaining: null,
        });
      }

      function addFive() {
        const add = 5 * 60000;
        if (pomo.running && pomo.endsAt) {
          const started = numOr(pomo.startedRemaining, totalMs) + add;
          updatePomo({
            phase: pomo.phase,
            round: pomo.round,
            running: true,
            endsAt: pomo.endsAt + add,
            remaining: started,
            startedRemaining: started,
          });
        } else {
          updatePomo({
            phase: pomo.phase,
            round: pomo.round,
            running: false,
            endsAt: null,
            remaining: pomo.remaining + add,
            startedRemaining: null,
          });
        }
      }

      function collapse() {
        setMinimized(true);
        writeJSON(KEY_MIN, true);
      }

      function expand() {
        setMinimized(false);
        writeJSON(KEY_MIN, false);
      }

      function weekData() {
        const out = [];
        const base = new Date();
        for (let i = 6; i >= 0; i -= 1) {
          const dt = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
          const key = dateKeyOf(dt);
          out.push({
            key: key,
            label: d.week[dt.getDay()],
            done: intOr(stats.history[key], 0, 0, 9999),
          });
        }
        return out;
      }

      function streakDays() {
        const base = new Date();
        let n = 0;
        for (let i = 0; i < 400; i += 1) {
          const dt = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i);
          const key = dateKeyOf(dt);
          const v = intOr(stats.history[key], 0, 0, 9999);
          if (v > 0) n += 1;
          else if (i === 0) continue;
          else break;
        }
        return n;
      }

      const anchor = anchorStyle(pos, { right: '22px', bottom: '22px' });

      if (minimized) {
        const miniSt =
          tab === 'pomo'
            ? {
                value: clockText(leftMs),
                label: phaseLabel,
                progress: phaseProgress,
                accent: phaseAccent,
              }
            : offSt;
        return h(
          'button',
          {
            type: 'button',
            className: 'owc-mini',
            style: anchor,
            onClick: expand,
            title: d.expand,
            'aria-label': d.title + ' ' + miniSt.label + ' ' + miniSt.value,
          },
          h('style', null, CSS),
          h(Ring, { progress: miniSt.progress, accent: miniSt.accent }),
          h(
            'span',
            { className: 'owc-mini-time', style: { color: miniSt.accent } },
            miniSt.value,
          ),
          h('span', { className: 'owc-mini-label' }, miniSt.label),
        );
      }

      const head = h(
        'div',
        {
          className: 'owc-head',
          onPointerDown: onPointerDown,
          onPointerMove: onPointerMove,
          onPointerUp: onPointerUp,
          onPointerCancel: onPointerUp,
        },
        h(
          'div',
          { className: 'owc-tabs', role: 'tablist' },
          h(
            'button',
            {
              type: 'button',
              role: 'tab',
              'aria-selected': tab === 'pomo',
              className: 'owc-tab' + (tab === 'pomo' ? ' owc-tab-on' : ''),
              onClick: function () {
                setTab('pomo');
              },
            },
            d.tabPomo,
          ),
          h(
            'button',
            {
              type: 'button',
              role: 'tab',
              'aria-selected': tab === 'off',
              className: 'owc-tab' + (tab === 'off' ? ' owc-tab-on' : ''),
              onClick: function () {
                setTab('off');
              },
            },
            d.tabOff,
          ),
          h(
            'button',
            {
              type: 'button',
              role: 'tab',
              'aria-selected': tab === 'stats',
              className: 'owc-tab' + (tab === 'stats' ? ' owc-tab-on' : ''),
              onClick: function () {
                setTab('stats');
              },
            },
            d.tabStats,
          ),
        ),
        h('span', { className: 'owc-spacer' }),
        h(
          'button',
          {
            type: 'button',
            className: 'owc-icon',
            onClick: openSettings,
            title: d.edit,
            'aria-label': d.edit,
          },
          h(IconGear),
        ),
        h(
          'button',
          {
            type: 'button',
            className: 'owc-icon',
            onClick: collapse,
            title: d.minimize,
            'aria-label': d.minimize,
          },
          h(IconMinus),
        ),
      );

      function numberRow(label, key, max, unit) {
        return h(
          'label',
          { className: 'owc-row' },
          h('span', { className: 'owc-caption' }, label),
          h(
            'span',
            { className: 'owc-field' },
            h('input', {
              type: 'number',
              min: 1,
              max: max,
              className: 'owc-input owc-input-num',
              value: draft[key],
              onChange: function (e) {
                change(key, e.target.value);
              },
            }),
            h('span', { className: 'owc-unit' }, unit),
          ),
        );
      }

      function switchRow(label, key) {
        return h(
          'div',
          { className: 'owc-opt' },
          h('span', { className: 'owc-opt-label' }, label),
          h(Switch, {
            label: label,
            value: !!draft[key],
            onToggle: function () {
              toggleSetting(key);
            },
          }),
        );
      }

      let body;
      if (editing) {
        body = h(
          'div',
          { className: 'owc-edit' },
          h(
            'label',
            { className: 'owc-row' },
            h('span', { className: 'owc-caption' }, d.startLabel),
            h('input', {
              type: 'time',
              className: 'owc-input',
              value: draft.start,
              onChange: function (e) {
                change('start', e.target.value);
              },
            }),
          ),
          h(
            'label',
            { className: 'owc-row' },
            h('span', { className: 'owc-caption' }, d.endLabel),
            h('input', {
              type: 'time',
              className: 'owc-input',
              value: draft.end,
              onChange: function (e) {
                change('end', e.target.value);
              },
            }),
          ),
          numberRow(d.setFocus, 'focus', 120, d.minuteUnit),
          numberRow(d.setShort, 'short', 60, d.minuteUnit),
          numberRow(d.setLong, 'long', 180, d.minuteUnit),
          numberRow(d.setLongEvery, 'longEvery', 8, d.roundsUnit),
          h('div', { className: 'owc-section' }, d.optSection),
          switchRow(d.optAuto, 'autoNext'),
          switchRow(d.optSound, 'sound'),
          switchRow(d.optNotify, 'notify'),
          switchRow(d.optTitle, 'titleSync'),
          switchRow(d.optRhythm, 'rhythm'),
          invalid ? h('div', { className: 'owc-hint' }, invalid) : null,
          h(
            'div',
            { className: 'owc-actions' },
            h(
              'button',
              {
                type: 'button',
                className: 'owc-btn owc-primary',
                onClick: commit,
                disabled: !!invalid,
              },
              d.save,
            ),
            h(
              'button',
              { type: 'button', className: 'owc-btn', onClick: resetAll },
              d.defaults,
            ),
            h(
              'button',
              { type: 'button', className: 'owc-btn', onClick: closeSettings },
              d.cancel,
            ),
          ),
        );
      } else if (tab === 'stats') {
        const week = weekData();
        const max = Math.max(1, ...week.map(function (x) { return x.done; }));
        const bars = week.map(function (x) {
          const height = x.done > 0 ? Math.max(4, Math.round((x.done / max) * 30)) : 2;
          return h(
            'div',
            { key: x.key, className: 'owc-day' },
            h('div', {
              className: 'owc-bar' + (x.done > 0 ? '' : ' owc-bar-empty'),
              style: { height: height + 'px' },
              title: x.key + ' · ' + x.done,
            }),
            h('span', { className: 'owc-day-label' }, x.label),
          );
        });
        body = h(
          'div',
          null,
          h('div', { className: 'owc-caption' }, d.statsToday),
          h(
            'div',
            { className: 'owc-stats-num' },
            String(stats.done),
            h('span', { className: 'owc-stats-unit' }, d.statsUnitPomo),
          ),
          h(
            'div',
            { className: 'owc-stats-line' },
            Math.round(stats.focusMs / 60000) +
              d.statsUnitMin +
              ' · ' +
              d.statsAbandon +
              ' ' +
              stats.abandoned +
              ' · ' +
              d.statsStreak +
              ' ' +
              streakDays() +
              d.statsDays,
          ),
          h('div', { className: 'owc-caption' }, d.statsWeek),
          h('div', { className: 'owc-week' }, bars),
        );
      } else if (tab === 'pomo') {
        const dots = [];
        for (let i = 0; i < settings.longEvery; i += 1) {
          dots.push(
            h('i', {
              key: 'dot' + i,
              className: 'owc-dot' + (i < pomo.round ? ' owc-dot-on' : ''),
            }),
          );
        }
        body = h(
          'div',
          null,
          h('div', { className: 'owc-caption' }, phaseLabel),
          h(
            'div',
            { className: 'owc-big', style: { color: phaseAccent } },
            clockText(leftMs),
          ),
          h(
            'div',
            { className: 'owc-track' },
            h('div', {
              className: 'owc-fill',
              style: {
                width: (phaseProgress * 100).toFixed(1) + '%',
                background: phaseAccent,
              },
            }),
          ),
          h(
            'div',
            { className: 'owc-foot' },
            h('div', { className: 'owc-dots' }, dots),
            h(
              'div',
              { className: 'owc-controls' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'owc-btn owc-primary owc-btn-sm',
                  onClick: toggleRun,
                },
                pomo.running ? d.pause : d.run,
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'owc-btn owc-btn-sm',
                  onClick: addFive,
                  title: d.addFive + ' ' + d.minuteUnit,
                  'aria-label': d.addFive + ' ' + d.minuteUnit,
                },
                d.addFive,
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'owc-icon',
                  onClick: skipPhase,
                  title: d.skip,
                  'aria-label': d.skip,
                },
                h(IconSkip),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'owc-icon',
                  onClick: restartPhase,
                  title: d.restart,
                  'aria-label': d.restart,
                },
                h(IconRestart),
              ),
            ),
          ),
        );
      } else {
        body = h(
          'div',
          null,
          h('div', { className: 'owc-caption' }, offSt.label),
          h(
            'div',
            { className: 'owc-big', style: { color: offSt.accent } },
            offSt.value,
          ),
          offSt.note ? h('div', { className: 'owc-note' }, offSt.note) : null,
          h(
            'div',
            { className: 'owc-track' },
            h('div', {
              className: 'owc-fill',
              style: {
                width: (offSt.progress * 100).toFixed(1) + '%',
                background: offSt.accent,
              },
            }),
          ),
          h(
            'div',
            { className: 'owc-foot' },
            h('span', null, settings.start + ' → ' + settings.end),
            h(
              'span',
              null,
              pomo.running
                ? clockText(leftMs)
                : d.tabPomo + ' ' + settings.focus + d.minuteUnit,
            ),
          ),
        );
      }

      return h(
        'div',
        { className: 'owc-card' + (burst ? ' owc-shake' : ''), style: anchor },
        h('style', null, CSS),
        burst
          ? h(
              'div',
              { className: 'owc-flash' },
              burst.mode === 'break' ? d.doneFocus : d.doneBreak,
            )
          : null,
        burst
          ? h(
              'div',
              { className: 'owc-burst', 'aria-hidden': 'true' },
              burst.parts.map(function (p) {
                return h('span', {
                  key: p.key,
                  className: 'owc-spark',
                  style: {
                    '--x': p.x + 'px',
                    '--y': p.y + 'px',
                    '--d': p.delay + 'ms',
                    width: p.size + 'px',
                    height: p.size + 'px',
                    background: p.color,
                  },
                });
              }),
            )
          : null,
        head,
        note
          ? h(
              'div',
              {
                key: note.id,
                className: 'owc-note-banner owc-tone-' + note.tone,
                role: 'status',
                onClick: function () {
                  setNote(null);
                },
                title: d.edit,
              },
              note.text,
            )
          : null,
        body,
      );
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        const loc = ctx.get('locale');
        if (loc) {
          locale = loc;
          ctx.effect(function () {
            return loc.subscribe(function () {
              langListeners.forEach(function (notify) {
                notify();
              });
            });
          }, 'offwork-countdown.locale');
        }
        ctx.slots.inject('shell.overlay', function () {
          return ctx.slots.register(
            {
              name: 'shell.overlay',
              id: 'offwork-countdown',
              order: 20,
            },
            FloatCountdown,
          );
        });
      },
    };
  },
});
