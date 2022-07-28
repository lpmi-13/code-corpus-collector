import argparse
import ast
import astor
import git
import logging
import os
import shutil
import sys
from pymongo import MongoClient

parser = argparse.ArgumentParser()
parser.add_argument("-D", "--delete_clones", help="delete cloned repos after processing", action="store_true")
parser.add_argument("-V", "--verbose", help="output verbose logging", action="store_true")

args = parser.parse_args()

GITHUB_FILE_PATH_INTERMEDIATE = '/blob/master/'
REPO_DIR = 'repositories'

try:
    client = MongoClient(host = ['localhost:27017'], serverSelectionTimeoutMS = 2000)
    client.server_info()
    db = client.python
except:
    print('mongo isn\'t running yet...please start it first')
    sys.exit()

functions = db.functions

def convert_code_line(index, contents):
    return {"line_number": index + 1, "line_content": contents}

def extract_and_store(node, mongo_collection, filepath, full_repo_url):

    file_path_in_remote_repo = filepath.split('/')[2:]
    filename = filepath.split('/')[-1]

    # copy it back to what it looks like in the source, conveniently incorporating whitespace
    code = astor.to_source(node)
    split_code = [line for line in code.split('\n') if line != '']

    # this is ugly, but the quickest way to get the file contents by line, which we need for the direct link to the file in github
    with open(filepath, 'r') as input_file:
       file_lines = input_file.readlines()
    
    # now stop everything and get the line from the original file
    for ind, x in enumerate(file_lines):
        
        # IT'S A HACKDAY!!!
        # TODO : later, see if there's an easy way to check for the variable
        # being assigned, the equals, and the first char after the equals to
        # be at a particular line in the file, since this approach currently
        # misses assignment like the following that gets split across lines:
        # new_dict = {
        #     "thing1": 3,
        #     "thing2": 2,
        #     "thing3": 1
        # }
        if x.strip().replace('"', '\'') == split_code[0].replace('"', '\''):
            original_file_line = ind + 1
            break

    try:
        if args.verbose:
            print(f'file path being written is {file_path_in_remote_repo}')
        mongo_collection.insert_one({"type": f"{mongo_collection.name}",
                             "language": "python",
                             "project_source": full_repo_url,
                             "direct_link_to_file_line": full_repo_url + GITHUB_FILE_PATH_INTERMEDIATE + '/'.join(file_path_in_remote_repo) + f'#L{original_file_line}',
                             "contents": {
                               "total_lines": len(split_code),
                               "lines": [convert_code_line(ind,x) for ind, x in enumerate(split_code)] }})
        if args.verbose:
            print(f'inserting {mongo_collection.name} from {filepath}...')
            print('\n')

    except:
        if ars.verbose:
            print('skipping this one, for reasons...')

def grab_examples(full_repo_url, filepath):
    """
    we grab the contents of each file and parse it, then walk it
    ...though sometimes the file is something weird like a symlink, so skip it
    if that's the case
    """
    try:
        with open(filepath, 'r') as source:
            file_contents = source.read()

        try:
            tree = ast.parse(file_contents)
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    extract_and_store(node, functions, filepath, full_repo_url)
                if isinstance(node, ast.AsyncFunctionDef):
                    extract_and_store(node, asyncfunctions, filepath, full_repo_url)

        except:
            if args.verbose:
                print('ast parse error, skip this one')
    except:
        if args.verbose:
            print('skip this file')

with open('repositories.txt', 'r') as input_file:
    urls = input_file.readlines()

if not os.path.exists(REPO_DIR):
    os.mkdir(REPO_DIR)

for url in urls:
    url = url.strip()
    local_dir_name = os.path.join(REPO_DIR, url.split('/')[-1])

    print(f'cloning {url}...')
    
    try:
        git.Git(f'{REPO_DIR}').clone(url, depth=1)

        print(f'processing {local_dir_name}...')

        for path, subdirs, files in os.walk(local_dir_name):
            for name in files:
                if name.endswith('.py'):
                    grab_examples(url, os.path.join(path, name))

        if args.delete_clones:
            print(f'deleting {local_dir_name}')
            shutil.rmtree(local_dir_name)

    except Exception as Argument:
        logging.exception('error occurred while handling repo')