/**
 * RAKUDA AI SOLUTION - Booking Modal (3-Step Wizard)
 * Step 1: Select date from 2-week calendar
 * Step 2: Select time slot
 * Step 3: Enter name/email, confirm & submit
 */

var bookState = {
  date: null,
  time: null,
  calOffset: 0,
};

// ── Helpers ──────────────────────────────────────────────────────────

function _padZero(n) {
  return n < 10 ? '0' + n : '' + n;
}

function _formatDate(d) {
  return d.getFullYear() + '-' + _padZero(d.getMonth() + 1) + '-' + _padZero(d.getDate());
}

function _displayDate(d) {
  var days = ['日', '月', '火', '水', '木', '金', '土'];
  return (
    (d.getMonth() + 1) + '月' + d.getDate() + '日（' + days[d.getDay()] + '）'
  );
}

// ── Open / Close ─────────────────────────────────────────────────────

/**
 * Open the booking modal, reset state, render calendar.
 */
function openBooking() {
  var modal = document.getElementById('bookingModal');
  if (!modal) return;

  // Reset state
  bookState.date = null;
  bookState.time = null;
  bookState.calOffset = 0;

  // Reset UI
  var stepsArea = document.getElementById('bookingStepsArea');
  var completeArea = document.getElementById('bookingComplete');
  if (stepsArea) {
    stepsArea.classList.remove('is-hide');
    stepsArea.classList.add('is-show');
  }
  if (completeArea) {
    completeArea.classList.remove('is-show');
    completeArea.classList.add('is-hide');
  }

  // Reset form fields
  ['bName', 'bEmail', 'bCompany'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Reset selected display
  var btnDate = document.getElementById('btnDate');
  var btnTime = document.getElementById('btnTime');
  if (btnDate) btnDate.textContent = '日付を選択';
  if (btnTime) btnTime.textContent = '時間を選択';

  modal.classList.add('is-open');
  document.body.classList.add('modal-open');

  goBookStep(1);
  renderCal();

  if (typeof trackEvent === 'function') {
    trackEvent('booking_open');
  }
}

/**
 * Close the booking modal.
 */
function closeBooking() {
  var modal = document.getElementById('bookingModal');
  if (!modal) return;

  modal.classList.remove('is-open');
  document.body.classList.remove('modal-open');
}

// ── Step Navigation ──────────────────────────────────────────────────

/**
 * Switch between wizard steps (1, 2, 3).
 * @param {number} n - step number
 */
function goBookStep(n) {
  for (var i = 1; i <= 3; i++) {
    var step = document.getElementById('bookStep' + i);
    if (step) {
      step.style.display = i === n ? 'block' : 'none';
    }
  }

  // Update progress bar
  var progress = document.getElementById('bookingProgress');
  if (progress) {
    var bars = progress.querySelectorAll('.progress-step, [data-step]');
    bars.forEach(function (bar) {
      var stepNum = parseInt(bar.getAttribute('data-step'), 10);
      bar.classList.remove('active', 'completed');
      if (stepNum < n) {
        bar.classList.add('completed');
      } else if (stepNum === n) {
        bar.classList.add('active');
      }
    });
    // Fallback: set width-based progress bar
    var fill = progress.querySelector('.progress-fill');
    if (fill) {
      fill.style.width = Math.round(((n - 1) / 2) * 100) + '%';
    }
  }

  // Populate summary on step 3
  if (n === 3) {
    var sumDate = document.getElementById('sumDate');
    var sumTime = document.getElementById('sumTime');
    if (sumDate && bookState.date) {
      sumDate.textContent = _displayDate(new Date(bookState.date));
    }
    if (sumTime && bookState.time) {
      sumTime.textContent = bookState.time;
    }
  }
}

// ── Calendar Rendering ───────────────────────────────────────────────

/**
 * Render a 2-week calendar grid starting from today + calOffset.
 */
function renderCal() {
  var calTitle = document.getElementById('calTitle');
  var calGrid = document.getElementById('calGrid');
  if (!calGrid) return;

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var startDate = new Date(today);
  startDate.setDate(startDate.getDate() + bookState.calOffset * 14);

  // Don't allow going before today
  if (startDate < today) {
    startDate = new Date(today);
  }

  var endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 13); // 2 weeks

  // Title
  if (calTitle) {
    calTitle.textContent =
      (startDate.getMonth() + 1) + '/' + startDate.getDate() +
      ' - ' +
      (endDate.getMonth() + 1) + '/' + endDate.getDate();
  }

  // Build grid
  var html = '';
  var dayLabels = ['日', '月', '火', '水', '木', '金', '土'];

  // Header row
  html += '<div class="cal-header">';
  dayLabels.forEach(function (label) {
    html += '<span class="cal-day-label">' + label + '</span>';
  });
  html += '</div>';

  // Find the Monday of the start week (or Sunday, depending on layout)
  // We'll start from Sunday of the week that contains startDate
  var gridStart = new Date(startDate);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());

  html += '<div class="cal-body">';

  var current = new Date(gridStart);
  for (var row = 0; row < 2; row++) {
    // Find the Sunday of this week row
    if (row > 0) {
      // Jump to next week's Sunday
      current = new Date(gridStart);
      current.setDate(current.getDate() + 7 * row);
    }

    for (var col = 0; col < 7; col++) {
      var cellDate = new Date(current);
      cellDate.setDate(cellDate.getDate() + col);

      var dateStr = _formatDate(cellDate);
      var isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
      var isPast = cellDate < today;
      var isSelected = bookState.date === dateStr;
      var isInRange = cellDate >= startDate && cellDate <= endDate;

      var classes = ['cal-cell'];
      if (isWeekend) classes.push('is-weekend');
      if (isPast) classes.push('is-past');
      if (isSelected) classes.push('is-selected');
      if (!isInRange) classes.push('is-outside');

      var disabled = isWeekend || isPast || !isInRange;

      html +=
        '<button class="' + classes.join(' ') + '"' +
        (disabled ? ' disabled' : '') +
        ' data-date="' + dateStr + '"' +
        ' onclick="selectDate(\'' + dateStr + '\')">' +
        cellDate.getDate() +
        '</button>';
    }
  }

  html += '</div>';
  calGrid.innerHTML = html;
}

/**
 * Navigate calendar backwards by 2 weeks.
 */
function calPrev() {
  if (bookState.calOffset > 0) {
    bookState.calOffset--;
    renderCal();
  }
}

/**
 * Navigate calendar forwards by 2 weeks.
 */
function calNext() {
  bookState.calOffset++;
  renderCal();
}

/**
 * Select a date from the calendar.
 * @param {string} dateStr - YYYY-MM-DD format
 */
function selectDate(dateStr) {
  bookState.date = dateStr;

  // Update button display
  var btnDate = document.getElementById('btnDate');
  if (btnDate) {
    btnDate.textContent = _displayDate(new Date(dateStr));
  }

  // Re-render to show selection
  renderCal();

  // Auto-advance to step 2
  goBookStep(2);
  renderTimeSlots();
}

// ── Time Slots ───────────────────────────────────────────────────────

/**
 * Render available time slots.
 */
function renderTimeSlots() {
  var timeGrid = document.getElementById('timeGrid');
  if (!timeGrid) return;

  var slots = ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  var html = '';

  slots.forEach(function (slot) {
    var isSelected = bookState.time === slot;
    html +=
      '<button class="time-slot' + (isSelected ? ' is-selected' : '') + '"' +
      ' onclick="selectTime(\'' + slot + '\')">' +
      slot +
      '</button>';
  });

  timeGrid.innerHTML = html;
}

/**
 * Select a time slot.
 * @param {string} time - e.g. "10:00"
 */
function selectTime(time) {
  bookState.time = time;

  // Update button display
  var btnTime = document.getElementById('btnTime');
  if (btnTime) {
    btnTime.textContent = time;
  }

  // Re-render to show selection
  renderTimeSlots();

  // Auto-advance to step 3
  goBookStep(3);
}

// ── Confirm Booking ──────────────────────────────────────────────────

/**
 * Validate and submit the booking.
 */
function confirmBooking() {
  var name = (document.getElementById('bName') || {}).value || '';
  var email = (document.getElementById('bEmail') || {}).value || '';
  var company = (document.getElementById('bCompany') || {}).value || '';

  // Validation
  if (!name.trim()) {
    alert('お名前を入力してください。');
    return;
  }
  if (!email.trim()) {
    alert('メールアドレスを入力してください。');
    return;
  }
  if (!bookState.date || !bookState.time) {
    alert('日時を選択してください。');
    return;
  }

  var data = {
    date: bookState.date,
    time: bookState.time,
    name: name.trim(),
    email: email.trim(),
    company: company.trim(),
  };

  var confirmBtn = document.querySelector('#bookStep3 .btn-submit, #bookStep3 button[type="submit"]');
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = '予約中...';
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/booking', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      // Show completion
      var stepsArea = document.getElementById('bookingStepsArea');
      var completeArea = document.getElementById('bookingComplete');
      if (stepsArea) {
        stepsArea.classList.remove('is-show');
        stepsArea.classList.add('is-hide');
      }
      if (completeArea) {
        completeArea.classList.remove('is-hide');
        completeArea.classList.add('is-show');
      }

      if (typeof trackEvent === 'function') {
        trackEvent('booking_submit', { date: data.date, time: data.time });
      }
    } else {
      alert('予約に失敗しました。もう一度お試しください。');
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = '予約を確定する';
      }
    }
  };
  xhr.onerror = function () {
    alert('通信エラーが発生しました。インターネット接続をご確認ください。');
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = '予約を確定する';
    }
  };
  xhr.send(JSON.stringify(data));
}

// ── Click overlay to close ───────────────────────────────────────────
document.addEventListener('click', function (e) {
  if (e.target.id === 'bookingModal' && e.target.classList.contains('modal-overlay')) {
    closeBooking();
  }
});

// ── Escape key to close ──────────────────────────────────────────────
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    closeBooking();
  }
});
