package main

import (
	"bytes"
	"context"
	"fmt"
	"go/ast"
	"go/parser"
	"go/printer"
	"go/token"
	"io/ioutil"
	"path/filepath"
	"strings"

	"log"
	"os"

	"github.com/go-git/go-git/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var ctx = context.TODO()

type CodeContent map[string]interface{}

func main() {

	// grabbing the connection from args to enable local testing
	connectionURI := os.Args[1]

	clientOptions := options.Client().ApplyURI(connectionURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
	}

	mongo_collection := client.Database("golang").Collection("functions")

	repoDirectory := filepath.Join(".", "/repositories")
	err = os.MkdirAll(repoDirectory, os.ModePerm)
	if err != nil {
		log.Fatal(err)
	}

	// just so we can easily trim the URL to only be the "owner/repo" string
	substringToCut := "https://github.com/"
	contents, err := ioutil.ReadFile("repositories.txt")
	if err != nil {
		log.Fatal(err)
	}
	separateRepos := strings.Split(string(contents), "\n")
	// fmt.Println(separateRepos)
	for i := 0; i < len(separateRepos)-1; i++ {
		fmt.Println("repo name is:", separateRepos[i])
		// we need this to clone and insert into the json structure
		fullURl := separateRepos[i]
		justRepo := separateRepos[i][len(substringToCut):]
		fmt.Println("short name:", justRepo)
		fmt.Println("cloning repo:", justRepo)

		_, err = git.PlainClone(repoDirectory+"/"+justRepo, false, &git.CloneOptions{
			Depth:    1,
			URL:      fullURl,
			Progress: os.Stdout,
		})

		// here's where we walk the repositories directory recursively and find all the *.go files
		err = filepath.Walk(repoDirectory+"/"+justRepo,
			func(path string, info os.FileInfo, err error) error {
				fileExtension := filepath.Ext(path)
				// since we only care about "*.go" files, just short circuit if the file isn't one of those
				if fileExtension != ".go" {
					return nil
				}
				if err != nil {
					log.Fatal(err)
				}
				fmt.Println(path, info.Size())

				pathArray := strings.Split(path, "/")
				parsedSource := strings.Join(pathArray[0:3], "/")
				fmt.Println("processing:", parsedSource)

				fset := token.NewFileSet()
				// and here we open the file and read it into our "parseAST function"
				node, err := parser.ParseFile(fset, path, nil, parser.DeclarationErrors)
				if err != nil {
					// sometimes there are weird cases where the AST parser fails
					// (eg, for one particular file in golang/go, bizarrely)
					// ...so we just skip those
					fmt.Println("Error parsing file: " + path)
					fmt.Println("skipping this one...")
					return nil
				}

				ast.Inspect(node, func(n ast.Node) bool {
					switch t := n.(type) {
					// find variable declarations
					case *ast.FuncDecl:
						// this particular implementation doesn't get us line numbers from the original file,
						// which we would need for a direct link to it in GitHub, but maybe we don't care about that
						var buf bytes.Buffer
						printer.Fprint(&buf, fset, t)
						text := buf.String()
						lines := strings.Split(text, "\n")

						// these fields aren't camelcase, since we need to standardize across languages
						// and this was the convention I picked
						snippet := bson.M{
							"type":           "functions",
							"project_source": "https://github.com/" + parsedSource,
							"contents": bson.M{
								"total_lines": len(lines),
								"lines":       convertCodeContent(lines),
							},
						}
						_, err = mongo_collection.InsertOne(ctx, snippet)
						if err != nil {
							log.Fatal(err)
						}
					}
					return true
				})

				return nil
			})

		if err != nil {
			log.Fatal(err)
		}
		fmt.Println("deleting:", repoDirectory+"/"+justRepo)
		err = os.RemoveAll(repoDirectory + "/" + justRepo)
		if err != nil {
			log.Fatal(err)
		}
	}

	err = client.Disconnect(context.TODO())

	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Connection to MongoDB closed.")
}

func convertCodeContent(lines []string) []CodeContent {
	finalData := []CodeContent{}
	for i := 0; i < len(lines); i++ {
		var m = CodeContent{
			"line_number":  i + 1,
			"line_content": lines[i],
		}
		finalData = append(finalData, m)
	}
	return finalData
}
