import 'package:flutter/material.dart';

class SidebarPlaylistItem {
  final String id;
  final String name;

  const SidebarPlaylistItem({
    required this.id,
    required this.name,
  });
}

class Sidebar extends StatelessWidget {
  final String activeSection;
  final List<SidebarPlaylistItem> playlists;
  final ValueChanged<String> onSectionSelected;
  final ValueChanged<String> onPlaylistSelected;
  final VoidCallback onNewPlaylist;

  const Sidebar({
    super.key,
    required this.activeSection,
    required this.playlists,
    required this.onSectionSelected,
    required this.onPlaylistSelected,
    required this.onNewPlaylist,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 264,
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
      decoration: const BoxDecoration(
        color: Color(0xFF12151B),
        border: Border(
          right: BorderSide(color: Color(0x1AFFFFFF)),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Text(
            'Aero Music',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 28),
          _NavButton(
            label: 'Library',
            icon: Icons.library_music_rounded,
            active: activeSection == 'library',
            onTap: () => onSectionSelected('library'),
          ),
          const SizedBox(height: 8),
          _NavButton(
            label: 'Playlists',
            icon: Icons.queue_music_rounded,
            active: activeSection == 'playlists',
            onTap: () => onSectionSelected('playlists'),
          ),
          const SizedBox(height: 28),
          const Text(
            'PLAYLISTS',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
              color: Color(0xFF9AA4B2),
            ),
          ),
          const SizedBox(height: 10),
          Expanded(
            child: ListView.separated(
              itemCount: playlists.length,
              separatorBuilder: (_, __) => const SizedBox(height: 4),
              itemBuilder: (BuildContext context, int index) {
                final SidebarPlaylistItem playlist = playlists[index];
                return InkWell(
                  borderRadius: BorderRadius.circular(12),
                  onTap: () => onPlaylistSelected(playlist.id),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    child: Text(
                      playlist.name,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFFE6EBF2),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: onNewPlaylist,
              icon: const Icon(Icons.add_rounded),
              label: const Text('New Playlist'),
            ),
          ),
        ],
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool active;
  final VoidCallback onTap;

  const _NavButton({
    required this.label,
    required this.icon,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF1C2230) : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: <Widget>[
            Icon(icon, size: 18, color: active ? const Color(0xFF3DDC97) : const Color(0xFF9AA4B2)),
            const SizedBox(width: 12),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: active ? Colors.white : const Color(0xFFCBD5E1),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
