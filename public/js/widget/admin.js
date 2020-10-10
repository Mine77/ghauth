(function () {
    let CurrectPage = 1, PageSize = 8;
    document.querySelector(".admin-widget-load-btn").addEventListener("click", function (e) {
        document.querySelector(".admin-widget-container").classList.add("active");
        e.target.remove();
        fetchUserList(CurrectPage, PageSize);
    });

    function dateFormat(fmt, date) {
        date = new Date(date);
        let ret;
        const opt = {
            "Y+": date.getFullYear().toString(),
            "m+": (date.getMonth() + 1).toString(),
            "d+": date.getDate().toString(),
            "H+": date.getHours().toString(),
            "M+": date.getMinutes().toString(),
            "S+": date.getSeconds().toString()
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            };
        };
        return fmt;
    }

    function fetchUserList(currectPage, pageSize) {
        fetch(`/admin/getUserList?currectPage=${currectPage}&pageSize=${pageSize}`, { method: 'GET' })
            .then(result => result.json())
            .then(result => {
                let child, btn, btnchild;
                document.querySelector("#user-list").innerText = "";
                for (let i = 0; i < result["data"].length; i++) {
                    tr = document.createElement("tr");

                    child = document.createElement("th");
                    child.setAttribute("scope", "row");
                    child.innerText = result["data"][i]["playername"];
                    child.title = result["data"][i]["playername"];
                    tr.appendChild(child);

                    child = document.createElement("td");
                    child.innerText = result["data"][i]["email"];
                    child.title = result["data"][i]["email"];
                    tr.appendChild(child);

                    child = document.createElement("td");
                    child.innerText = dateFormat("YYYY-mm-dd", result["data"][i]["time"]["register"]);
                    tr.appendChild(child);

                    child = document.createElement("td");
                    child.innerHTML = genUserBadge(result["data"][i]["isAdmin"], result["data"][i]["isBanned"]);
                    tr.appendChild(child);

                    child = document.createElement("td");
                    tr.appendChild(child);

                    btn = document.createElement("button");
                    btn.setAttribute("type", "button");
                    btn.classList.add("userlist-btn");
                    btn.classList.add("btn");
                    btn.classList.add("btn-primary");
                    btn.classList.add("btn-sm");

                    btnchild = document.createElement("span");
                    btnchild.classList.add("spinner-border");
                    btnchild.classList.add("spinner-border-sm");
                    btnchild.setAttribute("role", "status");
                    btnchild.setAttribute("aria-hidden", "true");
                    btn.appendChild(btnchild);

                    btnchild = document.createElement("span");
                    btnchild.classList.add("btn-text");
                    btn.appendChild(btnchild);

                    btn.uuid = result["data"][i]["uuid"];
                    btn.addEventListener("click", switchStatusBtnClicked);
                    if (result["data"][i]["isAdmin"]) {
                        btn.classList.add("no-action");
                        btn.setAttribute("disabled", "disabled");
                        btnchild.innerText = "无";
                    } else if (result["data"][i]["isBanned"]) {
                        btnchild.innerText = "解封";
                    } else {
                        btnchild.innerText = "封禁";
                    }
                    child.appendChild(btn);
                    document.querySelector("#user-list").appendChild(tr);
                }
                genPaginate(currectPage, pageSize, result["total"]);
            })
            .catch(e => {
                toastr["error"]("拉取用户列表失败");
            });
    }

    function switchStatusBtnClicked(e) {
        e.target.setAttribute("disabled", "disabled");
        let uuid = e.target.uuid;
        fetch(`/admin/switchUserStatus?uuid=${uuid}`, { method: 'POST' })
            .then(result => result.json())
            .then(result => result["code"])
            .then(code => {
                switch (code) {
                    case 0:
                        // 操作成功
                        break;
                    default:
                        toastr["error"]("操作失败，请重试");
                        break;
                }
                fetchUserList(CurrectPage, PageSize);
            })
            .catch(e => {
                toastr["error"]("操作失败，请重试");
                e.target.removeAttribute("disabled");
            });
    }

    function genUserBadge(isAdmin, isBanned) {
        let badgeList = "";
        if (isAdmin) {
            badgeList += "<span class=\"badge badge-pill badge-info\">管理员</span> ";
        }
        if (isBanned) {
            badgeList += "<span class=\"badge badge-pill badge-danger\">封禁中</span>";
        } else {
            badgeList += "<span class=\"badge badge-pill badge-success\">玩家</span>";
        }
        return badgeList;
    }

    function genPaginate(currectPage, pageSize, total) {
        let totalPages = Math.ceil(total / pageSize);
        let userListPaginate = document.querySelector(".userlist-pagination");
        userListPaginate.innerHTML = "";
        let previousBtn, nextBtn, pageBtn, gap;

        // 上一页
        if (currectPage == 1) {
            previousBtn = document.createElement("span");
            previousBtn.classList.add("disabled");
        } else {
            previousBtn = document.createElement("a");
            previousBtn.setAttribute("rel", "prev");
        }
        previousBtn.innerText = "上一页";
        previousBtn.classList.add("previous_page");
        previousBtn.addEventListener("click", prevPage);
        userListPaginate.appendChild(previousBtn);


        if (totalPages <= 5) {
            //无需绘制省略号
            for (let i = 1; i <= totalPages; i++) {
                if (i == currectPage) {
                    pageBtn = document.createElement("em");
                    pageBtn.classList.add("current");
                } else if (i + 1 == currectPage) {
                    pageBtn = document.createElement("a");
                    pageBtn.setAttribute("rel", "next");
                } else if (i - 1 == currectPage) {
                    pageBtn = document.createElement("a");
                    pageBtn.setAttribute("rel", "prev");
                } else {
                    pageBtn = document.createElement("a");
                }
                pageBtn.innerText = i;
                pageBtn.page = i;
                pageBtn.setAttribute("aria-label", `Page ${i}`);

                if (i != currectPage) {
                    pageBtn.addEventListener("click", jumpToPage);
                }

                userListPaginate.appendChild(pageBtn);
            }
        } else {
            if (currectPage < 3) {
                for (let i = 1; i <= 3; i++) {
                    if (i == currectPage) {
                        pageBtn = document.createElement("em");
                        pageBtn.classList.add("current");
                    } else if (i + 1 == currectPage) {
                        pageBtn = document.createElement("a");
                        pageBtn.setAttribute("rel", "next");
                    } else if (i - 1 == currectPage) {
                        pageBtn = document.createElement("a");
                        pageBtn.setAttribute("rel", "prev");
                    } else {
                        pageBtn = document.createElement("a");
                    }
                    pageBtn.innerText = i;
                    pageBtn.page = i;
                    pageBtn.setAttribute("aria-label", `Page ${i}`);

                    if (i != currectPage) {
                        pageBtn.addEventListener("click", jumpToPage);
                    }

                    userListPaginate.appendChild(pageBtn);
                }

                gap = document.createElement("span");
                gap.innerText = "...";
                gap.classList.add("gap");
                userListPaginate.appendChild(gap);

                pageBtn = document.createElement("a");
                pageBtn.innerText = totalPages;
                pageBtn.page = totalPages;
                pageBtn.setAttribute("aria-label", `Page ${totalPages}`);
                pageBtn.addEventListener("click", jumpToPage);
                userListPaginate.appendChild(pageBtn);

            } else if (currectPage > totalPages - 2) {
                pageBtn = document.createElement("a");
                pageBtn.innerText = 1;
                pageBtn.page = 1;
                pageBtn.setAttribute("aria-label", `Page ${1}`);
                pageBtn.addEventListener("click", jumpToPage);
                userListPaginate.appendChild(pageBtn);

                gap = document.createElement("span");
                gap.innerText = "...";
                gap.classList.add("gap");
                userListPaginate.appendChild(gap);

                for (var i = totalPages - 2; i <= totalPages; i++) {
                    if (i == currectPage) {
                        pageBtn = document.createElement("em");
                        pageBtn.classList.add("current");
                    } else if (i + 1 == currectPage) {
                        pageBtn = document.createElement("a");
                        pageBtn.setAttribute("rel", "next");
                    } else if (i - 1 == currectPage) {
                        pageBtn = document.createElement("a");
                        pageBtn.setAttribute("rel", "prev");
                    } else {
                        pageBtn = document.createElement("a");
                    }
                    pageBtn.innerText = i;
                    pageBtn.page = i;
                    pageBtn.setAttribute("aria-label", `Page ${i}`);

                    if (i != currectPage) {
                        pageBtn.addEventListener("click", jumpToPage);
                    }

                    userListPaginate.appendChild(pageBtn);
                }
            } else if (currectPage >= 3 && currectPage <= totalPages - 4) {
                pageBtn = document.createElement("a");
                pageBtn.innerText = 1;
                pageBtn.page = 1;
                pageBtn.setAttribute("aria-label", `Page ${1}`);
                pageBtn.addEventListener("click", jumpToPage);
                userListPaginate.appendChild(pageBtn);

                gap = document.createElement("span");
                gap.innerText = "...";
                gap.classList.add("gap");
                userListPaginate.appendChild(gap);

                for (var i = currectPage; i <= currectPage + 1; i++) {
                    if (i == currectPage) {
                        pageBtn = document.createElement("em");
                        pageBtn.classList.add("current");
                    } else if (i + 1 == currectPage) {
                        pageBtn = document.createElement("a");
                        pageBtn.setAttribute("rel", "next");
                    } else if (i - 1 == currectPage) {
                        pageBtn = document.createElement("a");
                        pageBtn.setAttribute("rel", "prev");
                    } else {
                        pageBtn = document.createElement("a");
                    }
                    pageBtn.innerText = i;
                    pageBtn.page = i;
                    pageBtn.setAttribute("aria-label", `Page ${i}`);

                    if (i != currectPage) {
                        pageBtn.addEventListener("click", jumpToPage);
                    }

                    userListPaginate.appendChild(pageBtn);
                }

                gap = document.createElement("span");
                gap.innerText = "...";
                gap.classList.add("gap");
                userListPaginate.appendChild(gap);

                pageBtn = document.createElement("a");
                pageBtn.innerText = totalPages;
                pageBtn.page = totalPages;
                pageBtn.setAttribute("aria-label", `Page ${totalPages}`);
                pageBtn.addEventListener("click", jumpToPage);
                userListPaginate.appendChild(pageBtn);
            } else {
                pageBtn = document.createElement("a");
                pageBtn.innerText = 1;
                pageBtn.page = 1;
                pageBtn.setAttribute("aria-label", `Page ${1}`);
                pageBtn.addEventListener("click", jumpToPage);
                userListPaginate.appendChild(pageBtn);

                gap = document.createElement("span");
                gap.innerText = "...";
                gap.classList.add("gap");
                userListPaginate.appendChild(gap);

                for (var i = currectPage - 1; i <= currectPage; i++) {
                    if (i == currectPage) {
                        pageBtn = document.createElement("em");
                        pageBtn.classList.add("current");
                    } else if (i + 1 == currectPage) {
                        pageBtn = document.createElement("a");
                        pageBtn.setAttribute("rel", "next");
                    } else if (i - 1 == currectPage) {
                        pageBtn = document.createElement("a");
                        pageBtn.setAttribute("rel", "prev");
                    } else {
                        pageBtn = document.createElement("a");
                    }
                    pageBtn.innerText = i;
                    pageBtn.page = i;
                    pageBtn.setAttribute("aria-label", `Page ${i}`);

                    if (i != currectPage) {
                        pageBtn.addEventListener("click", jumpToPage);
                    }

                    userListPaginate.appendChild(pageBtn);
                }

                gap = document.createElement("span");
                gap.innerText = "...";
                gap.classList.add("gap");
                userListPaginate.appendChild(gap);

                pageBtn = document.createElement("a");
                pageBtn.innerText = totalPages;
                pageBtn.page = totalPages;
                pageBtn.setAttribute("aria-label", `Page ${totalPages}`);
                pageBtn.addEventListener("click", jumpToPage);
                userListPaginate.appendChild(pageBtn);
            }
        }

        // 下一页
        if (currectPage == totalPages) {
            nextBtn = document.createElement("span");
            nextBtn.classList.add("disabled");
        } else {
            nextBtn = document.createElement("a");
            nextBtn.setAttribute("rel", "next");
        }
        nextBtn.innerText = "下一页";
        nextBtn.classList.add("next_page");
        nextBtn.addEventListener("click", nextPage);
        userListPaginate.appendChild(nextBtn);


        function jumpToPage(e) {
            CurrectPage = e.target.page;
            fetchUserList(CurrectPage, PageSize);
        }
        function prevPage(e) {
            if (e.target.classList.contains("disabled")) return;
            CurrectPage--;
            fetchUserList(CurrectPage, PageSize);
        }
        function nextPage(e) {
            if (e.target.classList.contains("disabled")) return;
            CurrectPage++;
            fetchUserList(CurrectPage, PageSize);
        }

    }
})()