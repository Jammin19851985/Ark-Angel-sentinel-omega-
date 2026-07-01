import os
import re

for root, _, files in os.walk('components'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
                # Find occurrences of set[A-Z] not inside a function or callback
                # Actually, just print all setSomething() calls with their line numbers, 
                # but maybe just show lines with setSomething
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    # check if the line contains a state setter call but is not inside a JSX event handler or arrow function
                    if re.search(r'set[A-Z][a-zA-Z0-9_]*\([^)]*\)', line):
                        if '=>' not in line and 'function' not in line and 'onClick' not in line and 'useEffect' not in line:
                            print(f"{filepath}:{i+1}: {line.strip()}")
