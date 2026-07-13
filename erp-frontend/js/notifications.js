const Notifications = {
  notifications: [],

  async fetchNotifications(unreadOnly = false) {
    try {
      const auth = Auth.getAuth();
      const token = auth?.token;

      if (!token) {
        window.location.href = "login.html";
        return;
      }

      let url = "http://localhost:5000/api/notifications";
      if (unreadOnly) url += "?status=Unread";

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch notifications");
      }

      this.notifications = data.data.notifications || [];
      this.renderNotifications();

    } catch (error) {
      console.error("Notification Fetch Error:", error);
      Toast.error(error.message || 'Failed to load notifications');

      document.getElementById("notifications-list").innerHTML = `
        <div class="text-red-400 p-4">Failed to load notifications</div>
      `;
    }
  },

  renderNotifications() {
    const container = document.getElementById("notifications-list");
    if (!container) return;

    if (!this.notifications.length) {
      container.innerHTML = `
        <div class="text-slate-400 p-4">No notifications found</div>
      `;
      return;
    }

    container.innerHTML = this.notifications.map(n => `
      <div class="glass-card p-4 mb-4 flex justify-between items-center">
        <div>
          <p class="text-white font-medium">${n.message}</p>
          <p class="text-xs text-slate-400 mt-1">${new Date(n.createdAt).toLocaleString()}</p>
          <span class="${n.status === 'Unread' ? 'text-yellow-400' : 'text-green-400'} text-sm">
            ${n.status}
          </span>
        </div>

        <button onclick="Notifications.deleteNotification(${n.id})"
          class="px-3 py-1 bg-red-500/20 text-red-400 rounded">
          Delete
        </button>
      </div>
    `).join("");
  },

  async markAllRead() {
    try {
      const auth = Auth.getAuth();
      const token = auth?.token;

      if (!token) return;

      await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      this.fetchNotifications();
      Toast.success('All notifications marked as read.');
    } catch (error) {
      console.error("Mark All Read Error:", error);
      Toast.error('Failed to mark notifications as read.');
    }
  },

  async deleteNotification(id) {
    try {
      const auth = Auth.getAuth();
      const token = auth?.token;

      if (!token) return;

      await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      this.fetchNotifications();
      Toast.success('Notification deleted.');
    } catch (error) {
      console.error("Delete Notification Error:", error);
      Toast.error('Failed to delete notification.');
    }
  },

  init() {
    this.fetchNotifications();

    document.getElementById("filter-unread")?.addEventListener("change", (e) => {
      this.fetchNotifications(e.target.checked);
    });

    document.getElementById("mark-all-read")?.addEventListener("click", () => {
      this.markAllRead();
    });
  }
};

// Replaced page-level DOMContentLoaded with App.init in app.js