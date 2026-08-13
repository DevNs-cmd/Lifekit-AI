import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../core/design/tokens.dart';
import '../../core/repository.dart';

class AdminDashboardScreen extends ConsumerStatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  ConsumerState<AdminDashboardScreen> createState() =>
      _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends ConsumerState<AdminDashboardScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabCtrl = TabController(length: 4, vsync: this);
  List<Map<String, dynamic>> _users = [];
  List<Map<String, dynamic>> _logs = [];
  List<Map<String, dynamic>> _tickets = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadAdminData();
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadAdminData() async {
    try {
      final repo = ref.read(repositoryProvider);
      final results = await Future.wait([
        repo.adminUsers(),
        repo.adminAuditLogs(),
        repo.adminSupportTickets(),
      ]);
      if (!mounted) return;
      setState(() {
        _users = results[0];
        _logs = results[1];
        _tickets = results[2];
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = context.tokens;
    return Scaffold(
      backgroundColor: t.background,
      appBar: AppBar(
        title: const Text('Admin Management Console'),
        bottom: TabBar(
          controller: _tabCtrl,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Overview'),
            Tab(text: 'Users'),
            Tab(text: 'Audit Logs'),
            Tab(text: 'Support Queue'),
          ],
        ),
      ),
      body: _loading
          ? Center(child: CircularProgressIndicator(color: t.primary))
          : TabBarView(
              controller: _tabCtrl,
              children: [
                _buildOverview(t),
                _buildUsersTab(t),
                _buildLogsTab(t),
                _buildSupportTab(t),
              ],
            ),
    );
  }

  Widget _buildOverview(AppTokens t) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Row(
          children: [
            Expanded(
                child: _statBox(t, 'Total Users', '${_users.length + 1420}',
                    LucideIcons.users)),
            const SizedBox(width: 12),
            Expanded(
                child: _statBox(t, 'Platform Revenue', '₹8.4 Lakh',
                    LucideIcons.badgeIndianRupee)),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
                child: _statBox(
                    t, 'Active Missions', '4,890', LucideIcons.target)),
            const SizedBox(width: 12),
            Expanded(
                child: _statBox(
                    t, 'System Health', '99.98%', LucideIcons.activity)),
          ],
        ),
      ],
    );
  }

  Widget _statBox(AppTokens t, String label, String val, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: t.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: t.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: t.primary, size: 20),
          const SizedBox(height: 8),
          Text(val,
              style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: t.textPrimary)),
          Text(label, style: TextStyle(color: t.textMuted, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildUsersTab(AppTokens t) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _users.length,
      itemBuilder: (ctx, idx) {
        final u = _users[idx];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            title: Text(u['name'] ?? '',
                style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('${u['email']} • Plan: ${u['plan']}'),
            trailing: Chip(
                label: Text(u['role'] ?? 'User',
                    style: const TextStyle(fontSize: 10))),
          ),
        );
      },
    );
  }

  Widget _buildLogsTab(AppTokens t) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _logs.length,
      itemBuilder: (ctx, idx) {
        final log = _logs[idx];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: Icon(LucideIcons.shieldCheck, color: t.primary),
            title: Text(log['event'] ?? '',
                style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('By: ${log['actor']} • IP: ${log['ip']}'),
            trailing: Text(log['timestamp'] ?? '',
                style: TextStyle(color: t.textMuted, fontSize: 10)),
          ),
        );
      },
    );
  }

  Widget _buildSupportTab(AppTokens t) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _tickets.length,
      itemBuilder: (ctx, idx) {
        final tick = _tickets[idx];
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            title: Text(tick['subject'] ?? '',
                style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('User: ${tick['user']}'),
            trailing: Chip(
                label: Text(tick['status'] ?? 'Open',
                    style: const TextStyle(fontSize: 10))),
          ),
        );
      },
    );
  }
}
