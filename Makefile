NAME := chrome-event-logger-extension

extract:
	rm -fr export
	mkdir export
	git archive --prefix=$(NAME)/ -v --format zip HEAD > export/$(NAME).zip
	cd export && unzip -o $(NAME).zip
	rm export/$(NAME).zip
	rm -fr export/$(NAME)/PRIVATE-KEY \
            export/$(NAME)/images/screenshot-1280x800.png \
            export/$(NAME)/Makefile \
            export/$(NAME)/.gitignore \
            export/$(NAME)/bin

crx: extract
	cd export && zip -qr -9 -X $(NAME) $(NAME)
	cd export && ../bin/create-crx.sh $(NAME) ../PRIVATE-KEY

cws: extract
	cp PRIVATE-KEY export/$(NAME)/key.pem
	grep -v '"update_url"' export/$(NAME)/manifest.json > export/manifest.tmp
	mv export/manifest.tmp export/$(NAME)/manifest.json
	cd export && zip -qr -9 -X $(NAME)-cws $(NAME)

dist: crx
	./bin/upload-crx.py export/$(NAME).crx
	./bin/upload-update-manifest.py < export/$(NAME)/manifest.json

clean:
	find . -name '*~' | xargs -r rm
	rm -fr export

lint:
	jshint background.js
