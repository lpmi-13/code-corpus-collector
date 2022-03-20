package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-git/go-git/v5"
)

func main() {

	repoDirectory := filepath.Join(".", "/repositories")
	err := os.MkdirAll(repoDirectory, os.ModePerm)
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

		if err != nil {
			log.Fatal(err)
		}
	}

}
