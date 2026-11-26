"""Append the approved Beta build under beta/ after verifying the stable artifact."""

import argparse
import hashlib
import shutil
from html.parser import HTMLParser
from pathlib import Path


def published_files(root):
    if not root.is_dir() or root.is_symlink():
        raise ValueError(f'Expected a build directory: {root}')
    files = []
    for path in root.rglob('*'):
        relative = path.relative_to(root)
        if any(part.startswith('.') for part in relative.parts):
            continue
        if path.is_symlink() or not (path.is_file() or path.is_dir()):
            raise ValueError(f'Unsupported Pages asset: {path}')
        if path.is_file():
            files.append(relative)
    return sorted(files)


def fingerprint(root, paths):
    digest = hashlib.sha256()
    for path in paths:
        digest.update(path.as_posix().encode('utf-8') + b'\0')
        digest.update(hashlib.sha256((root / path).read_bytes()).digest())
    return digest.hexdigest()


class EntryAssets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'script' and attrs.get('src'):
            self.urls.append(attrs['src'])
        elif tag == 'link' and attrs.get('rel') in ('stylesheet', 'modulepreload'):
            self.urls.append(attrs.get('href', ''))


def assemble(stable, beta, expected):
    stable_paths = published_files(stable)
    if fingerprint(stable, stable_paths) != expected:
        raise ValueError('Stable build differs from the last approved stable Pages artifact')
    destination = stable / 'beta'
    if destination.exists() or destination.is_symlink():
        raise ValueError('Stable build already contains beta/')
    entry = EntryAssets()
    entry.feed((beta / 'index.html').read_text(encoding='utf-8'))
    beta_paths = published_files(beta)
    prefix = '/greg-public-study/beta/'
    if not entry.urls or any(
        not url.startswith(prefix + 'assets/') or Path(url[len(prefix):]) not in beta_paths
        for url in entry.urls
    ):
        raise ValueError('Beta entry assets must resolve inside /greg-public-study/beta/assets/')
    for path in beta_paths:
        target = destination / path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(beta / path, target)
    root_paths = [path for path in published_files(stable) if path.parts[0] != 'beta']
    if fingerprint(stable, root_paths) != expected:
        raise ValueError('Appending Beta changed the stable artifact')
    print(f'Preserved {len(root_paths)} stable files and added {len(beta_paths)} files under beta/')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('stable', type=Path)
    parser.add_argument('beta', type=Path)
    parser.add_argument('expected_stable_sha256')
    args = parser.parse_args()
    assemble(args.stable, args.beta, args.expected_stable_sha256)
